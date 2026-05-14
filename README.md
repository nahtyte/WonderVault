# 🔐 WonderVault

WonderVault is a full-stack password manager project built with a Python Flask backend and a modern React frontend. It demonstrates hybrid encryption using AES-GCM for payload confidentiality and RSA key wrapping for secure key management.

## 📁 Repository Structure

- `backend/`
  - `app.py` — Flask REST API exposing authentication and credential CRUD endpoints under `/api`
  - `models.py` — SQLAlchemy models for users and credentials
  - `crypto_utils.py` — AES-GCM and RSA helpers used by the backend
  - `requirements.txt` — Python dependencies for the backend service
  - `instance/` — application runtime files and database storage

- `frontend/`
  - `src/` — React UI implementation
  - `package.json` — frontend dependencies and scripts
  - `vite.config.js` — Vite configuration with API proxy
  - `index.css` — Tailwind CSS and custom dark theme styling

- `start.sh` — single-entry startup script for the app (optional)

## ✨ Key Features

- User registration and JWT-based login
- Hybrid encryption flow:
  - AES-GCM encrypts credential payloads
  - RSA wraps unique AES keys per credential
- Credential storage and retrieval via secure backend API
- React + Tailwind UI with a dark cyber theme
- Modular components and animated transitions

## 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\\Scripts\\activate
# macOS / Linux
# source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The backend will start on `http://127.0.0.1:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default, Vite proxies `/api` requests to the Flask backend.

### Open the App

Visit the frontend address shown by Vite, typically `http://localhost:5173`.

### One-click Start

If you have bash installed, run:

```bash
./start.sh
```

This script installs missing dependencies if needed and launches the backend and frontend together.

## 🧪 API Endpoints

The backend exposes these core endpoints:

- `POST /api/register` — create a new user
- `POST /api/login` — issue a JWT token
- `GET /api/credentials` — list stored credentials
- `POST /api/credentials` — store a new encrypted credential
- `DELETE /api/credentials/:id` — delete a credential

## ⚠️ Important Notes

- The current backend stores RSA private keys in plaintext within the database. This is acceptable for development/demo use but should be encrypted at rest in production.
- `app.py` uses a hard-coded `SECRET_KEY` for JWT signing. Replace it with an environment variable before deploying.
- The SQLite database file is created at `backend/wonderofvault.db`.

## 🧩 Tools & Dependencies

### Backend

- Flask
- Flask-CORS
- Flask-SQLAlchemy
- PyJWT
- bcrypt
- pycryptodome
- python-dotenv

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- framer-motion

## 💡 Notes

If you want to reset the backend database, delete `backend/wonderofvault.db` and restart the Flask server.

For local development, run the backend and frontend concurrently in separate terminals.
