# ChatSphere - Quick Start Guide (5 Minutes)

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Two terminals ready

---

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Start server
npm run dev
```

✅ Backend running on `http://localhost:5000`

---

## Step 2: Frontend Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to client
cd client

# Install dependencies (already done, but just in case)
npm install

# Start frontend
npm run dev
```

✅ Frontend running on `http://localhost:3000`

---

## Step 3: Test the App (1 minute)

1. Open `http://localhost:3000` in your browser
2. **Register** a new account:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
3. **Register another account** (use different email)
4. **Search** for the other user
5. **Send a message** and see it appear instantly! 💬

---

## 🎯 Next Steps

### Enable AI Features
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Add to `server/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart server and use AI features!

### Enable Voice Features
1. Set up Google Cloud Speech APIs
2. Add credentials to `server/.env`
3. Use voice recording and transcription!

---

## 📁 Project Structure Quick Reference

```
server/
├── routes/          # API endpoints
├── models/          # Database schemas
├── controllers/     # Business logic
├── utils/           # AI, speech services
└── server.js        # Main entry

client/
├── app/             # Next.js pages
├── components/      # React components
├── store/           # Zustand state
├── hooks/           # Custom hooks
└── lib/             # API client
```

---

## 🔧 Common Commands

### Backend
```bash
npm run dev          # Development mode
npm start            # Production
npm test             # Run tests
```

### Frontend
```bash
npm run dev          # Development
npm run build        # Build for production
npm start            # Production mode
npm run test         # Run tests
```

---

## ⚠️ Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `server/.env`

### "Port 5000 already in use"
- Change `PORT` in `server/.env` to 5001
- Restart server

### "Socket connection fails"
- Ensure backend is running on `:5000`
- Check browser console for errors
- Clear browser cache

### "Build errors"
- Delete `node_modules` folder
- Delete `.next` folder
- Run `npm install` again

---

## 🎓 Understanding the Architecture

### How Messages Flow:

```
User A Types Message
        ↓
React Component captures input
        ↓
Axios sends to Backend API
        ↓
Express validates & saves to MongoDB
        ↓
Socket.io broadcasts to User B
        ↓
User B's React component updates
        ↓
Message appears in real-time! 🎉
```

### Tech Stack Flow:

```
Client (Next.js/React)
        ↕ REST API + WebSocket
Server (Express/Node.js)
        ↕ Mongoose ODM
Database (MongoDB)
```

---

## 📱 Features to Try

1. **Real-time Messaging** - Type and see instant delivery
2. **Typing Indicators** - See when others are typing
3. **Online Status** - Know who's online
4. **Search Users** - Find people to chat with
5. **Create Groups** - Chat with multiple people
6. **Message Status** - See sent/delivered/read
7. **AI Assistant** - Get smart suggestions (with API key)
8. **Voice Messages** - Record and send audio

---

## 🚀 Deploy to Production

### Option 1: Heroku (Backend)
```bash
heroku create your-app-name
git push heroku main
```

### Option 2: Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Option 3: Railway/Render
- Connect GitHub repo
- Set environment variables
- Auto-deploy on push

---

## 📞 Need Help?

1. Check `SETUP.md` for detailed setup
2. Review `FEATURES.md` for feature list
3. Check server logs: Look at terminal running `npm run dev`
4. Check client logs: Open DevTools (F12)
5. Check network tab for API errors

---

## 🎉 Congratulations!

You now have a fully functional real-time chat application! 

**Next:** Read `SETUP.md` for advanced configuration and `FEATURES.md` for complete feature list.

---

**Happy Chatting! 💬✨**
