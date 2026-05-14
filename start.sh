#!/bin/bash
set -e

echo "🚀 Starting WonderVault..."

if [ ! -d "backend/venv" ]; then
  echo "📦 Backend environment not found. Bootstrapping..."
  mkdir -p backend
  cd backend
  python3 -m venv venv
  if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
  else
    source venv/bin/activate
  fi
  pip install -r requirements.txt
  cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "⚛️ Frontend dependencies not found. Installing..."
  mkdir -p frontend
  cd frontend
  npm install
  cd ..
fi

echo "🔐 Launching backend and frontend..."
cd backend
if [ -f "venv/Scripts/activate" ]; then
  source venv/Scripts/activate
else
  source venv/bin/activate
fi
python app.py &
BACKEND_PID=$!
cd ..

cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ WonderVault is starting."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both processes."

trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait $BACKEND_PID $FRONTEND_PID
