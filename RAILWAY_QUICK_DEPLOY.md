# 🚀 Railway Deployment - Quick Start (10 Minutes)

## 3-Step Deployment Process

---

## ✅ Step 1: Prepare (2 minutes)

### 1.1 Ensure GitHub is Updated
```bash
cd ChatSphere
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Get Your API Keys (5 minutes before)
- **OpenAI**: https://platform.openai.com/api-keys (optional)
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas (required)
  - Create cluster → Connect → Copy URI

### 1.3 Write Down These Values
- MongoDB URI: `mongodb+srv://user:pass@cluster.mongodb.net/chatsphere`
- OpenAI Key: `sk-...` (optional)
- JWT Secret: Generate random: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## ✅ Step 2: Deploy Backend (5 minutes)

### Option A: Via Railway Web UI (Easiest)

1. Go to **https://railway.app**
2. Click "**+ New Project**"
3. Select "**Deploy from GitHub**"
4. Choose **itsaahsan/ChatSphere**
5. Railway auto-detects Node.js → Click "**Deploy**"

### Set Environment Variables:

In Railway Dashboard → Your Project → Backend Service → Variables:

```
PORT=8000
NODE_ENV=production
MONGO_URI=mongodb+srv://your-user:your-password@cluster0.mongodb.net/chatsphere?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here-make-it-long
ENCRYPTION_KEY=your32characterencryptionkey!!
GEMINI_API_KEY=AIzaSyCywh89sWw4OUCrfXSNtllvjizBoFCFJI4
FRONTEND_URL=https://your-frontend-domain.com
```

**🎉 Backend is live!** Copy your Railway domain: `https://chatsphere-backend-xxxx.railway.app`

---

## ✅ Step 3: Deploy Frontend (3 minutes)

### Option A: Via Vercel (Recommended for Next.js)

1. Go to **https://vercel.com**
2. Click "**Add New** → **Project**"
3. Select GitHub → Choose **ChatSphere**
4. Set Root Directory: `/client`
5. Add Environment Variables:

```
NEXT_PUBLIC_API_URL=https://chatsphere-backend-xxxx.railway.app
NEXT_PUBLIC_SOCKET_URL=https://chatsphere-backend-xxxx.railway.app
NEXT_PUBLIC_ENABLE_AI_CHAT=true
```

6. Click "**Deploy**"

**🎉 Frontend is live!** Get your Vercel domain: `https://chatsphere-xxxx.vercel.app`

---

### Option B: Via Railway (If Preferred)

1. In Railway → "**+ New Service**" → "**GitHub**"
2. Select ChatSphere repo → Root `/client`
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Add same environment variables as above
6. Deploy

---

## ✅ Step 4: Test (Less than 1 minute)

1. Open your frontend domain
2. Click "Sign Up"
3. Create account with email
4. Send a message
5. ✅ Done!

---

## 🔗 Final Configuration

### Update Backend CORS

In Railway Backend → Variables, update:
```
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Test Connection

```bash
curl https://your-railway-backend.railway.app
# Should return: "API is running"
```

---

## 🎯 Result

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend API** | `https://your-api.railway.app` |
| **Database** | MongoDB Atlas (Cloud) |

---

## ⚠️ Troubleshooting

### Backend won't deploy
- Check if port 8000 is set in Railway variables
- Verify MONGO_URI is correct
- Check build logs in Railway dashboard

### Frontend can't connect
- Verify NEXT_PUBLIC_API_URL matches backend URL exactly (with https://)
- Redeploy frontend after updating URL
- Check browser console (F12) for errors

### Database connection fails
- Test MongoDB URI locally first
- Verify IP whitelist in MongoDB Atlas (allow all IPs: 0.0.0.0/0)
- Check username and password are correct

---

## 💡 Pro Tips

1. **Use Railway CLI for faster deploys:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway up
   ```

2. **Monitor logs in real-time:**
   ```bash
   railway logs --follow
   ```

3. **Scale as you grow:**
   - Railway auto-scales with usage
   - Start free, pay only for what you use
   - ~$5-10/month for a production app

---

## ✨ All Done!

Your ChatSphere app is now live on the internet! 🎉

**Next**: 
- Invite friends to test
- Configure AI features (add OpenAI key)
- Monitor performance in dashboards
- Scale as needed

---

**Questions?** See `DEPLOYMENT.md` for detailed guide.

Made with ❤️ - ChatSphere Team
