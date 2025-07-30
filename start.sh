#!/bin/bash

# AI Chat Translator Startup Script

echo "🚀 Starting AI Chat Translator..."

# Check if Redis is running
echo "📡 Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   - macOS: brew services start redis"
    echo "   - Ubuntu: sudo systemctl start redis"
    echo "   - Windows: docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi
echo "✅ Redis is running"

# Start backend
echo "🐍 Starting Django backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Start Django server in background
echo "🌐 Starting Django server on http://localhost:8000"
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 3

# Start frontend
echo "⚛️ Starting Next.js frontend..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start Next.js server
echo "🌐 Starting Next.js server on http://localhost:3000"
npm run dev &
NEXT_PID=$!

echo ""
echo "🎉 AI Chat Translator is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📊 Admin: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $DJANGO_PID $NEXT_PID; exit" INT
wait 