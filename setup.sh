#!/bin/bash

# Nexa Order Flow MVP Launch Script
echo "🚀 Starting Nexa Order Flow MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build the project"
    exit 1
fi

echo "✅ Build completed successfully!"

# Create uploads directory
mkdir -p uploads

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Start the backend: npm run start:backend"
echo "2. In another terminal, start the frontend: npm run start:frontend"
echo ""
echo "Or start both in development mode:"
echo "npm run dev:all"
echo ""
echo "The application will be available at:"
echo "- Backend API: http://localhost:3001"
echo "- Frontend UI: http://localhost:3000"
echo ""
echo "📚 See README.md for detailed usage instructions"
