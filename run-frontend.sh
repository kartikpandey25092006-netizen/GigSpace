#!/bin/bash

# GigSpace Frontend - Quick Setup & Run Script

echo "🚀 GigSpace Frontend Setup"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚙️  Setting up environment variables..."
    cp .env.local.example .env.local
    echo "✅ .env.local created (update with your values)"
fi

# Start development server
echo ""
echo "🎨 Starting frontend on http://localhost:3000..."
echo ""
npm run dev
