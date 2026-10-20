#!/bin/bash

# Navigate to project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Ensure directories exist
mkdir -p backend/data/uploads
mkdir -p backend/data/highlights
mkdir -p backend/data/logs
mkdir -p backend/data/music

# Set up Python Virtual Environment & PYTHONPATH
echo "Setting up Python Virtual Environment..."
cd "$PROJECT_ROOT/backend"
export PYTHONPATH="$PROJECT_ROOT/backend:$PYTHONPATH"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install backend dependencies if not installed
echo "Checking backend dependencies..."
pip install -r requirements.txt

# Start backend in background
echo "Starting backend server..."
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Install frontend dependencies and start Vite
echo "Starting frontend server..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run dev &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

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
