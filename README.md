# AI Chat Translator

A real-time chat application with AI-powered translation capabilities, built with Django Channels, Next.js, and Hugging Face translation models.

## Features

- 🔄 **Real-time Translation**: Instant message translation using MarianMT models
- 💬 **WebSocket Chat**: Real-time messaging with Django Channels
- 👥 **User Management**: JWT authentication and user profiles
- 🌍 **Multi-language Support**: English, Spanish, French, German, and more
- 📱 **Responsive UI**: Modern interface built with Next.js and Tailwind CSS
- 🔒 **Secure**: JWT authentication and CORS protection

## Tech Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django Channels** - WebSocket support
- **Django REST Framework** - API endpoints
- **Redis** - Channel layer backend
- **Hugging Face Transformers** - Translation models
- **PyTorch** - Deep learning framework

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Socket.io** - WebSocket client

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis server
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-chat-translator
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Start Redis**
   ```bash
   # On macOS with Homebrew
   brew install redis
   brew services start redis
   
   # On Ubuntu/Debian
   sudo apt-get install redis-server
   sudo systemctl start redis
   
   # On Windows (using WSL or Docker)
   docker run -d -p 6379:6379 redis:alpine
   ```

4. **Run Django migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Django server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/me/` - Get current user

### Chat
- `POST /api/chat/translate/` - Translate message
- `GET /api/chat/messages/<friend_id>/` - Get chat messages
- `GET /api/chat/friends/` - Get friends list
- `POST /api/chat/friends/request/` - Send friend request

### WebSocket
- `ws://localhost:8000/ws/chat/` - Real-time chat

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Translation Models

The application uses Hugging Face's MarianMT models for translation:

- **English ↔ Spanish**: `Helsinki-NLP/opus-mt-en-es`
- **English ↔ French**: `Helsinki-NLP/opus-mt-en-fr`
- **English ↔ German**: `Helsinki-NLP/opus-mt-en-de`

Models are automatically downloaded on first use and cached for performance.

## Development

### Running Tests
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
black .
isort .

# Frontend
npm run lint
npm run format
```

## Deployment

### Backend (Django)
1. Set `DEBUG=False` in settings
2. Configure production database (PostgreSQL recommended)
3. Set up Redis for production
4. Use Gunicorn or uWSGI as WSGI server
5. Configure static files serving

### Frontend (Next.js)
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub. 