# AI Chat Translator

A real-time chat application with AI-powered translation built with Next.js, WebSocket, and JWT authentication.

## Features

- **JWT Authentication**: Secure user login and registration
- **Real-time Messaging**: WebSocket-powered instant messaging
- **AI Translation**: Automatic message translation using OpenAI
- **Friends System**: Send and manage friend requests
- **Language Preferences**: Set preferred language for translations
- **Facebook Messenger-like UI**: Modern and intuitive interface
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.io
- **Authentication**: JWT tokens
- **AI**: OpenAI GPT-4 for translations
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ai-chat-translator
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file in the root directory:
\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
\`\`\`

4. Start the Socket.io server:
\`\`\`bash
npm run socket-server
\`\`\`

5. In a new terminal, start the Next.js development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

For testing purposes, you can use:
- **Email**: demo@example.com
- **Password**: password

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat interface
│   └── profile/           # User profile
├── components/            # React components
│   ├── chat/              # Chat-specific components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions
└── socket-server.js       # WebSocket server
\`\`\`

## Key Features Explained

### Authentication System
- JWT-based authentication with secure token storage
- User registration and login with password hashing
- Protected routes and API endpoints

### Real-time Chat
- WebSocket connection for instant messaging
- Online/offline status tracking
- Message history and persistence

### AI Translation
- Automatic translation based on user preferences
- Support for 10+ languages
- Original and translated message display

### Friends Management
- Send friend requests by email
- Accept/reject friend requests
- Friends list with online status

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy the application

### Socket Server Deployment

For production, deploy the Socket.io server separately:

1. Create a separate Node.js application for the socket server
2. Deploy to a service like Railway, Render, or Heroku
3. Update `NEXT_PUBLIC_SOCKET_URL` to point to your deployed socket server

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/translate` - Translate text
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `GET /api/messages/[friendId]` - Get chat messages

## WebSocket Events

- `sendMessage` - Send a new message
- `message` - Receive a message
- `userOnline` - User came online
- `userOffline` - User went offline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
