import json, base64, datetime, bcrypt, jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Credential
from crypto_utils import CryptoService
from Crypto.Random import get_random_bytes

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wonderofyou.db'
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

    # Validate required fields
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing required fields: email, password, username'}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 400

    # 1. Hash master password (bcrypt)
    hashed_pwd = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # 2. Setup RSA for Hybrid Encryption
    priv_pem, pub_pem = CryptoService.generate_rsa_keypair()

    new_user = User(
        username=data['username'],
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

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields: email, password'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        # Update last login time
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()

        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({
            'token': token,
            'email': user.email,
            'username': user.username,
            'last_login': user.last_login.isoformat()
        }), 200

    return jsonify({'message': 'Invalid email or password'}), 401

# --- Dashboard Route ---
@app.route('/api/dashboard', methods=['GET'])
@token_required
def dashboard(current_user):
    creds = Credential.query.filter_by(user_id=current_user.id).all()

    # Calculate stats
    total = len(creds)
    weak = 0
    reused = 0
    strong = 0

    # For now, return basic stats (in a real app, you'd analyze passwords)
    for c in creds:
        try:
            wrapped_key = base64.b64decode(c.encrypted_key)
            aes_key = CryptoService.rsa_decrypt(current_user.rsa_private_key.encode('utf-8'), wrapped_key)
            decrypted_json = CryptoService.aes_gcm_decrypt(aes_key, c.nonce, c.ciphertext, c.tag)
            data = json.loads(decrypted_json.decode('utf-8'))
            password = data.get('password', '')

            # Simple strength check
            has_upper = any(c.isupper() for c in password)
            has_lower = any(c.islower() for c in password)
            has_num = any(c.isdigit() for c in password)
            has_special = any(not c.isalnum() for c in password)

            if len(password) >= 12 and has_upper and has_lower and has_num and has_special:
                strong += 1
            elif len(password) >= 8:
                strong += 1
            else:
                weak += 1
        except:
            pass

    score = max(32, 100 - weak * 16 - reused * 10)

    return jsonify({
        'stats': {
            'total': total,
            'weak': weak,
            'reused': reused,
            'strong': strong,
            'score': score
        },
        'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
        'email': current_user.email,
        'username': current_user.username
    }), 200

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
    return jsonify({'message': 'Stored securely', 'id': new_cred.id}), 201

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
