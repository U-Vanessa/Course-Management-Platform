@echo off
echo 🚀 Setting up Facilitator Activity Tracker...

:: Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

:: Create database
echo 🗄️  Creating database...
call npm run db:create

:: Run migrations
echo 🔄 Running database migrations...
call npm run db:migrate

:: Seed sample data
echo 🌱 Seeding sample data...
call npm run db:seed

echo.
echo ✅ Setup complete!
echo.
echo 📋 Sample login credentials:
echo    Facilitator: john.facilitator@alu.edu / password123
echo    Manager: bob.manager@alu.edu / password123
echo    Admin: alice.admin@alu.edu / password123
echo.
echo 🚀 Start the server:
echo    npm run dev    (development with auto-reload)
echo    npm start      (production)
echo.
echo 📚 API Documentation: http://localhost:3001/api
echo 🏥 Health Check: http://localhost:3001/health
echo.
pause
