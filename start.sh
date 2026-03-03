#!/bin/bash

# GigSpace Backend Setup & Run Script
# This script runs both frontend and backend in development mode

set -e

echo "🚀 Starting GigSpace with Backend..."
echo ""

# Navigate to backend
cd "$(dirname "$0")/backend"

echo "📦 Installing backend dependencies (if needed)..."
npm install --silent 2>/dev/null || true

echo "✅ Backend ready!"
echo ""
echo "🗄️  Starting backend server on port 3002..."
npm run dev &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting for backend to initialize..."
sleep 3

echo "✅ Backend is running!"
echo ""
echo "📋 Test Credentials:"
echo "   User A (Gig Poster): usera@test.com / password123"
echo "   User B (Gig Acceptor): userb@test.com / password123"
echo ""

# Go to frontend
cd ../frontend

echo "🎨 Starting frontend server on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ GigSpace is ready!"
echo "================================"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
