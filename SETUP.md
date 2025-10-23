# ChatSphere - Real-time Chat Application Setup Guide

## 🚀 Quick Start

This is a comprehensive real-time chat web application built with Next.js, Node.js, Socket.io, and MongoDB with integrated AI assistant capabilities.

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud via MongoDB Atlas)
- Git

---

## 📋 Project Structure

```
ChatSphere/
├── server/                  # Node.js Express backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Authentication & upload middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes including AI & speech
│   ├── utils/             # Utilities (AI, speech services)
│   ├── .env               # Environment variables
│   ├── server.js          # Main server file
│   └── package.json       # Server dependencies
│
└── client/                # Next.js frontend
    ├── app/               # Next.js App Router
    ├── components/        # React components
    │   ├── Auth/         # Login/Signup
    │   └── Chat/         # Chat UI components
    ├── hooks/             # Custom React hooks
    ├── lib/               # API clients
    ├── store/             # Zustand state management
    ├── public/            # Static assets
    ├── .env.local         # Environment variables
    └── package.json       # Client dependencies
```

---

## ⚙️ Installation & Setup

### Step 1: Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env` file already created):
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chatsphere

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars

# Message Encryption
ENCRYPTION_KEY=your32characterencryptionkey!!

# AI APIs (OpenAI)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Frontend URLs
DEV_FRONTEND_URLS=http://localhost:3000,http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB:
   - **Local:** `mongod`
   - **Cloud:** Use MongoDB Atlas connection string in `MONGO_URI`

5. Start the server:
```bash
npm run dev
```
Server will run on `http://localhost:5000`

---

### Step 2: Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables (`.env.local` already configured):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=ChatSphere

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_CALLS=true
NEXT_PUBLIC_ENABLE_VIDEO_CALLS=true
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_VOICE_MESSAGES=true
```

4. Start the development server:
```bash
npm run dev
```
Client will run on `http://localhost:3000`

---

## ✨ Features Implemented

### Core Messaging
- ✅ Real-time 1-on-1 messaging
- ✅ Group chats and chat rooms
- ✅ Message status (sent, delivered, read)
- ✅ Typing indicators
- ✅ Online/offline user status
- ✅ Message reactions (emojis)
- ✅ Edit and delete messages
- ✅ Message search within chats
- ✅ Pin important chats
- ✅ Archive conversations

### AI Features
- ✅ AI Assistant chat integration (OpenAI GPT)
- ✅ Smart reply suggestions
- ✅ Conversation summaries
- ✅ AI-powered message generation

### Voice & Speech
- ✅ Voice message recording
- ✅ Speech-to-Text (Google Cloud Speech API)
- ✅ Text-to-Speech conversion
- ✅ Voice message playback

### User Features
- ✅ User authentication (JWT)
- ✅ Profile management
- ✅ User search and discovery
- ✅ Contact management
- ✅ Block/unblock users
- ✅ Status updates

### User Experience
- ✅ Responsive design (mobile & desktop)
- ✅ Dark theme with green accents
- ✅ Smooth animations and transitions
- ✅ Real-time notifications
- ✅ Custom scrollbars
- ✅ Loading states and error handling

### Technical
- ✅ Socket.io real-time communication
- ✅ WebRTC support for calls
- ✅ Message encryption
- ✅ File uploads
- ✅ CORS configured
- ✅ Rate limiting ready
- ✅ Comprehensive API endpoints

---

## 🔌 API Endpoints

### Authentication
- `POST /api/user/register` - Create new account
- `POST /api/user/login` - Login user
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Messaging
- `POST /api/message/` - Send message
- `GET /api/message/:chatId` - Get chat messages
- `PUT /api/message/edit` - Edit message
- `DELETE /api/message/delete/:messageId` - Delete message
- `PUT /api/message/read` - Mark as read
- `GET /api/message/search` - Search messages

### Chats
- `GET /api/chat/` - Get all chats
- `POST /api/chat/` - Create/access chat
- `POST /api/chat/group` - Create group chat
- `PUT /api/chat/pin` - Pin chat
- `PUT /api/chat/archive` - Archive chat

### AI Features
- `POST /api/ai/reply` - Get AI reply
- `POST /api/ai/summary` - Generate summary
- `POST /api/ai/smart-replies` - Get smart replies

### Speech
- `POST /api/speech/speech-to-text` - Transcribe audio
- `POST /api/speech/text-to-speech` - Generate speech

---

## 🔌 Socket.io Events

### Emit (Client to Server)
- `setup` - Initialize socket connection
- `join chat` - Join a chat room
- `new message` - Send new message
- `typing` - User is typing
- `stop typing` - User stopped typing
- `message read` - Mark message as read
- `message reaction` - Add emoji reaction

### Listen (Server to Client)
- `connected` - Socket authenticated
- `message received` - New message received
- `typing` - Someone is typing
- `online users` - User came online
- `offline users` - User went offline
- `all online users` - Get all online users
- `message status update` - Message status changed

---

## 🛠️ Development

### Run in Development Mode

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

### Build for Production

**Backend:**
Server runs directly with Node.js, no build needed

**Frontend:**
```bash
cd client
npm run build
npm start
```

---

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT authentication tokens
- Message encryption (AES)
- CORS protection
- Input validation
- Protected API routes
- File upload validation

---

## 📦 Dependencies

### Backend
- Express.js - Web framework
- Socket.io - Real-time communication
- MongoDB & Mongoose - Database
- JWT - Authentication
- OpenAI - AI integration
- Multer - File uploads
- Bcryptjs - Password hashing

### Frontend
- Next.js 14 - React framework
- TypeScript - Type safety
- Zustand - State management
- Socket.io-client - Real-time client
- Tailwind CSS - Styling
- Axios - HTTP client
- React Icons - Icon library

---

## 🚀 Environment Variables

### Server (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/chatsphere
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ENCRYPTION_KEY=your32characterencryptionkey!!
OPENAI_API_KEY=sk-your-api-key
DEV_FRONTEND_URLS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_VOICE_MESSAGES=true
```

---

## 📖 Usage

1. **Register/Login**: Create account or login with existing credentials
2. **Search Users**: Use search to find users to chat with
3. **Start Chat**: Click on user to open 1-on-1 or create group
4. **Send Messages**: Type message and press Enter or click Send
5. **Voice Messages**: Click microphone icon to record
6. **AI Assistant**: Open AI chat for suggestions and help
7. **Manage Profile**: Update avatar, name, and status

---

## 🐛 Troubleshooting

### Server Won't Connect to MongoDB
- Ensure MongoDB service is running (`mongod` for local)
- Check MongoDB URI in .env file
- Verify firewall allows MongoDB port (27017)

### Socket.io Connection Issues
- Check that both client and server are running
- Verify FRONTEND_URL matches client URL in .env
- Check browser console for errors

### Build Errors
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Clear npm cache with `npm cache clean --force`

### Port Already in Use
- Change PORT in .env (e.g., 5001)
- Or kill process using the port

---

## 📝 Next Steps

1. **Add Database Seeding**: Create initial test data
2. **Deploy to Cloud**: Heroku, Railway, or Vercel
3. **Add More AI Features**: Custom prompts, context awareness
4. **Implement Video Calls**: Full WebRTC integration
5. **Mobile App**: React Native version
6. **Analytics**: Track user engagement

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console for error messages
4. Verify environment variables are set correctly

---

## 📄 License

MIT License - Feel free to use this for personal or commercial projects

---

**Made with ❤️ - ChatSphere Team**
