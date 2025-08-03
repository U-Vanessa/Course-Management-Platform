#!/bin/bash
# Setup script for Facilitator Activity Tracker

echo "🚀 Setting up Facilitator Activity Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL client not found. Make sure MySQL server is running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create database
echo "🗄️  Creating database..."
npm run db:create

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate

# Seed sample data
echo "🌱 Seeding sample data..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "📋 Sample login credentials:"
echo "   Facilitator: john.facilitator@alu.edu / password123"
echo "   Manager: bob.manager@alu.edu / password123"
echo "   Admin: alice.admin@alu.edu / password123"
echo ""
echo "🚀 Start the server:"
echo "   npm run dev    (development with auto-reload)"
echo "   npm start      (production)"
echo ""
echo "📚 API Documentation: http://localhost:3001/api"
echo "🏥 Health Check: http://localhost:3001/health"
