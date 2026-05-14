import json, base64, datetime, bcrypt, jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Credential
from crypto_utils import CryptoService
from Crypto.Random import get_random_bytes

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wonderofvault.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'super-secret-vault-key-2026' # Change in production

db.init_app(app)

# --- JWT Middleware ---
def token_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Authentication token is missing!'}), 401
        try:
            # Bearer <token>
            token = token.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        return f(current_user, *args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

# --- Auth Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400

    # 1. Hash master password (bcrypt)
    hashed_pwd = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # 2. Setup RSA for Hybrid Encryption
    priv_pem, pub_pem = CryptoService.generate_rsa_keypair()

    new_user = User(
        email=data['email'],
        password_hash=hashed_pwd,
        rsa_public_key=pub_pem.decode('utf-8'),
        rsa_private_key=priv_pem.decode('utf-8') # In real production, encrypt this too!
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token, 'email': user.email})
    
    return jsonify({'message': 'Invalid credentials'}), 401

# --- Credential CRUD ---
@app.route('/api/credentials', methods=['POST'])
@token_required
def add_credential(current_user):
    data = request.json
    # Hybrid Encryption Flow:
    # 1. Generate unique AES key for this record
    aes_key = get_random_bytes(32)
    # 2. Encrypt record with AES-GCM
    enc_data = CryptoService.aes_gcm_encrypt(aes_key, json.dumps(data).encode('utf-8'))
    # 3. Wrap AES key with User's RSA Public Key
    wrapped_key = CryptoService.rsa_encrypt(current_user.rsa_public_key.encode('utf-8'), aes_key)

    new_cred = Credential(
        user_id=current_user.id,
        website=data['website'],
        encrypted_key=base64.b64encode(wrapped_key).decode('utf-8'),
        ciphertext=enc_data['ciphertext'],
        nonce=enc_data['iv'],
        tag=enc_data['tag']
    )
    db.session.add(new_cred)
    db.session.commit()
    return jsonify({'message': 'Stored securely'})

@app.route('/api/credentials', methods=['GET'])
@token_required
def get_credentials(current_user):
    creds = Credential.query.filter_by(user_id=current_user.id).all()
    output = []
    for c in creds:
        # Unwrap AES key with RSA Private Key
        wrapped_key = base64.b64decode(c.encrypted_key)
        aes_key = CryptoService.rsa_decrypt(current_user.rsa_private_key.encode('utf-8'), wrapped_key)
        
        # Decrypt payload with AES-GCM
        decrypted_json = CryptoService.aes_gcm_decrypt(aes_key, c.nonce, c.ciphertext, c.tag)
        data = json.loads(decrypted_json.decode('utf-8'))
        data['id'] = c.id
        output.append(data)
    
    return jsonify(output)

@app.route('/api/credentials/<int:id>', methods=['DELETE'])
@token_required
def delete_credential(current_user, id):
    cred = Credential.query.filter_by(id=id, user_id=current_user.id).first()
    if not cred:
        return jsonify({'message': 'Credential not found'}), 404
    
    db.session.delete(cred)
    db.session.commit()
    return jsonify({'message': 'Credential deleted successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Change this line:
    app.run(debug=True, port=5000, host='0.0.0.0')