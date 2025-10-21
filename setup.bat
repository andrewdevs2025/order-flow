@echo off
REM Nexa Order Flow MVP Launch Script for Windows

echo 🚀 Starting Nexa Order Flow MVP...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install-all

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Build the project
echo 🔨 Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Failed to build the project
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

REM Create uploads directory
if not exist uploads mkdir uploads

echo.
echo 🎉 Setup completed successfully!
echo.
echo To start the application:
echo 1. Start the backend: npm run start:backend
echo 2. In another terminal, start the frontend: npm run start:frontend
echo.
echo Or start both in development mode:
echo npm run dev:all
echo.
echo The application will be available at:
echo - Backend API: http://localhost:3001
echo - Frontend UI: http://localhost:3000
echo.
echo 📚 See README.md for detailed usage instructions
pause
