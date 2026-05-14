#!/bin/bash
echo "🚀 Initializing Secure Password Manager..."

# Backend Setup
echo "📦 Setting up Python Backend..."
mkdir -p backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install Flask Flask-SQLAlchemy Flask-CORS PyJWT bcrypt pycryptodome python-dotenv
cd ..

# Frontend Setup
echo "⚛️ Setting up React Frontend..."
mkdir -p frontend
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer lucide-react
npx tailwindcss init -p
cd ..

echo "✅ Setup Complete!"
echo "To run the backend: cd backend && source venv/bin/activate && python app.py"
echo "To run the frontend: cd frontend && npm run dev"