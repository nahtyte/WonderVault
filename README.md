# 🔐 WonderVault

A full-stack, hybrid cryptographic password manager built for secure data encapsulation. 

Unlike standard implementations that rely entirely on pre-built libraries for asymmetric cryptography, **WonderVault features a custom-built RSA math engine**.

## 🛠️ Architecture
* **Frontend:** Vanilla HTML/JS with asynchronous API fetch routing.
* **Backend:** Python Flask API.
* **Confidentiality:** AES-128-CBC symmetric encryption for payload data.
* **Key Encapsulation:** RSA-1024 asymmetric encryption to secure the AES keys.

## 🌟 Bonus Feature: Custom Cryptography
To demonstrate a deep understanding of cryptographic mathematics, the RSA modular exponentiation was built from scratch. Located in `crypto_math.py`, the system utilizes a custom **Square-and-Multiply algorithm** (`effModuloExp`) to handle massive integer calculations without relying on standard Python math libraries or `Crypto.PublicKey.RSA`.

## 🚀 How to Run
1. Install dependencies: `pip install -r requirements.txt`
2. Run the server: `python app.py`
3. Open your browser to `http://127.0.0.1:5000`