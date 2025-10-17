#!/bin/bash

# 🍎 AI Calorie Tracker - Quick Setup Script

echo "🍎 AI Calorie Tracker - Setup Script"
echo "===================================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "✅ Node.js version: $node_version"
echo ""

# Install client dependencies
echo "📥 Installing frontend dependencies..."
cd client
npm install
echo "✅ Frontend dependencies installed!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created! Please update with your credentials."
else
    echo "ℹ️  .env file already exists"
fi
echo ""

# Done
echo "🎉 Setup complete!"
echo ""
echo "📱 To start the app:"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:5173"
echo ""
echo "Happy coding! 🚀"
