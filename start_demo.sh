#!/bin/bash

# Ensure directories exist
mkdir -p backend/data/uploads
mkdir -p backend/data/highlights

# Set up Python Virtual Environment
echo "Setting up Python Virtual Environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install backend dependencies if not installed
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Start backend in background
echo "Starting backend server..."
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Install frontend dependencies and start Vite
echo "Starting frontend server..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================================="
echo "FRAMR is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: Check Vite output for the localhost URL"
echo "Press Ctrl+C to stop both servers."
echo "====================================================="

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM
wait
