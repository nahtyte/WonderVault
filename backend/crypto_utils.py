import base64
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes

class CryptoService:
    @staticmethod
    def derive_master_key(password: str, salt: bytes) -> bytes:
        """Derives a 256-bit encryption key from the master password."""
        return PBKDF2(password, salt, dkLen=32, count=200000)

    @staticmethod
    def generate_rsa_keypair():
        """Generates a 2048-bit RSA key pair for hybrid encryption."""
        key = RSA.generate(2048)
        return key.export_key(), key.publickey().export_key()

    @staticmethod
    def aes_gcm_encrypt(key: bytes, plaintext: bytes) -> dict:
        """Encrypts data using AES-256-GCM."""
        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext)
        return {
            'iv': base64.b64encode(cipher.nonce).decode('utf-8'),
            'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
            'tag': base64.b64encode(tag).decode('utf-8')
        }

    @staticmethod
    def aes_gcm_decrypt(key: bytes, iv: str, ciphertext: str, tag: str) -> bytes:
        """Decrypts AES-256-GCM data, verifying integrity via the tag."""
        cipher = AES.new(key, AES.MODE_GCM, nonce=base64.b64decode(iv))
        return cipher.decrypt_and_verify(
            base64.b64decode(ciphertext),
            base64.b64decode(tag)
        )

    @staticmethod
    def rsa_encrypt(public_key_pem: bytes, plaintext: bytes) -> bytes:
        """Wraps the AES credential key using RSA-OAEP."""
        rsa_key = RSA.import_key(public_key_pem)
        cipher_rsa = PKCS1_OAEP.new(rsa_key)
        return cipher_rsa.encrypt(plaintext)

    @staticmethod
    def rsa_decrypt(private_key_pem: bytes, ciphertext: bytes) -> bytes:
        """Unwraps the AES credential key."""
        rsa_key = RSA.import_key(private_key_pem)
        cipher_rsa = PKCS1_OAEP.new(rsa_key)
        return cipher_rsa.decrypt(ciphertext)