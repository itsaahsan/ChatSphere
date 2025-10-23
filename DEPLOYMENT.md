# ChatSphere - Railway Deployment Guide

## 🚀 Deploy to Railway in 10 Minutes

Railway is a modern deployment platform perfect for full-stack applications. This guide will help you deploy ChatSphere to Railway.

---

## Prerequisites

1. **GitHub Account** - With the ChatSphere repository pushed
2. **Railway Account** - Sign up at https://railway.app
3. **MongoDB Atlas Account** - For cloud database (https://www.mongodb.com/cloud/atlas)
4. **API Keys** - OpenAI and Google Cloud (optional)

---

## Step 1: Create MongoDB Database (Cloud)

### Option A: MongoDB Atlas (Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or login
3. Create a new cluster (Free tier available)
4. Click "Connect" and copy the connection string
5. Replace `<password>` with your database password
6. Copy full URI: `mongodb+srv://username:password@cluster0.mongodb.net/chatsphere?retryWrites=true&w=majority`

### Option B: Railway PostgreSQL (Alternative)

1. Use Railway's managed MongoDB when creating services (if available)
2. Railway will provide connection string automatically

---

## Step 2: Prepare Your Repository

```bash
# Ensure all changes are committed
cd ChatSphere
git add .
git commit -m "prepare: Ready for Railway deployment"
git push origin main
```

---

## Step 3: Deploy Backend to Railway

### Method 1: Web Dashboard (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize GitHub and select `itsaahsan/ChatSphere`
5. Select root directory or `/server`
6. Click "Deploy"

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Deploy
railway up
```

### Configure Backend Environment Variables

After deployment, add these environment variables in Railway dashboard:

```
PORT=8000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/chatsphere
JWT_SECRET=your-super-secret-jwt-key-generate-random-string
ENCRYPTION_KEY=your32characterencryptionkey!!
OPENAI_API_KEY=sk-your-openai-key
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
GOOGLE_SPEECH_API_KEY=your-api-key (optional)
AZURE_SPEECH_KEY=your-key (optional)
FRONTEND_URL=https://your-frontend-domain.com
DEV_FRONTEND_URLS=http://localhost:3000,https://your-frontend-domain.com
```

**Backend URL:** Railway will provide you with a domain like `https://chatsphere-api-production.up.railway.app`

---

## Step 4: Deploy Frontend to Railway (or Vercel)

### Option A: Vercel (Recommended for Next.js)

**Easiest for Next.js:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd client
vercel

# Follow prompts
```

**Or via GitHub:**
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Select `/client` as root directory
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-railway-url.com
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-railway-url.com
   NEXT_PUBLIC_ENABLE_AI_CHAT=true
   NEXT_PUBLIC_ENABLE_VOICE_MESSAGES=true
   ```
6. Deploy

### Option B: Railway (For Next.js)

1. In Railway dashboard, create another service
2. Select "GitHub" and choose the repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set working directory: `/client`
6. Add environment variables (same as above)

**Frontend URL:** Railway will provide domain like `https://chatsphere-client-production.up.railway.app`

---

## Step 5: Connect Frontend to Backend

Update your client environment variables with the backend URL from Railway:

```bash
cd client

# Create/update .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=ChatSphere
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_VOICE_MESSAGES=true
NEXT_PUBLIC_ENABLE_VOICE_CALLS=true
NEXT_PUBLIC_ENABLE_VIDEO_CALLS=true
EOF

git add .env.production
git commit -m "config: Add production environment variables"
git push origin main
```

---

## Step 6: Verify Deployment

### Check Backend

```bash
# Visit backend health check
curl https://your-backend-url.railway.app

# Should return: "API is running"
```

### Check Frontend

```bash
# Visit frontend
https://your-frontend-url.railway.app

# Should load the ChatSphere app
```

### Test Features

1. **Register Account** - Create test account
2. **Real-time Chat** - Test messaging
3. **AI Features** - If OpenAI key is configured
4. **Voice Messages** - If Google Cloud key is configured

---

## Environment Variables Summary

### Backend (.env)

```
# Server
PORT=8000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatsphere

# Auth
JWT_SECRET=generate-a-long-random-string-here
ENCRYPTION_KEY=32-character-key-for-encryption

# CORS
FRONTEND_URL=https://your-frontend-domain.com
DEV_FRONTEND_URLS=https://your-frontend-domain.com

# AI (OpenAI)
OPENAI_API_KEY=sk-your-key

# Voice (Google Cloud - optional)
GOOGLE_SPEECH_API_KEY=your-key

# Notifications (VAPID - optional)
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
ADMIN_EMAIL=admin@chatsphere.com
```

### Frontend (.env.production)

```
NEXT_PUBLIC_API_URL=https://your-backend-railway.app
NEXT_PUBLIC_SOCKET_URL=https://your-backend-railway.app
NEXT_PUBLIC_APP_NAME=ChatSphere
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_VOICE_MESSAGES=true
NEXT_PUBLIC_ENABLE_VOICE_CALLS=true
NEXT_PUBLIC_ENABLE_VIDEO_CALLS=true
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is long random string (32+ chars)
- [ ] ENCRYPTION_KEY is exactly 32 characters
- [ ] Database credentials are secure
- [ ] API keys are not in version control
- [ ] CORS is set to your production domain
- [ ] Environment variables are configured in Railway
- [ ] SSL/HTTPS is enabled (automatic on Railway)
- [ ] Database backups are enabled

---

## 🚨 Troubleshooting

### Build Fails

```bash
# Check logs in Railway dashboard
# Common issues:
# 1. Node version mismatch
# 2. Missing environment variables
# 3. Build script failure

# Solution:
# - Set Node version in railway.json or package.json
# - Verify all env vars are set
# - Run build locally to test
```

### Connection Issues

```
Error: MONGO_URI not configured
→ Add MONGO_URI to Railway environment variables

Error: Cannot connect to backend
→ Verify FRONTEND_URL in backend matches frontend domain
→ Check CORS settings
```

### Socket.io Not Connecting

```
Error: WebSocket connection failed
→ Ensure backend URL uses https:// not http://
→ Verify Socket.io CORS settings
→ Check that frontend and backend have same origin
```

### AI Features Not Working

```
Error: OpenAI API not configured
→ Generate OpenAI API key at https://platform.openai.com
→ Add to Railway env vars as OPENAI_API_KEY
→ Restart deployment
```

---

## 📊 Monitoring

### Railway Dashboard

1. Go to your Railway project
2. View logs in real-time
3. Monitor CPU and memory usage
4. Check deployment status
5. View error logs

### Common Monitoring Commands

```bash
# View recent logs
railway logs

# Follow logs in real-time
railway logs --follow

# View specific service
railway logs --service backend
```

---

## 💰 Cost Estimate (Free Tier Available)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Railway Deployment** | $5/month free | Auto-scales |
| **MongoDB Atlas** | 512 MB free | Enough for development |
| **Vercel Frontend** | Free | Unlimited deploys |
| **Total** | ~$5/month | Very affordable |

---

## 🔄 Continuous Deployment

### Automatic Updates

1. Railway watches your GitHub repository
2. Every push to `main` triggers deployment
3. Tests run automatically
4. Deploy on success

### Manual Deployment

```bash
# In Railway CLI
railway up

# Or through dashboard
# Click "Redeploy" button
```

---

## 📈 Scaling (When You Grow)

```
Current Setup (Free):
- 1 Node.js instance
- Shared MongoDB (512 MB)
- Auto-scaling disabled

Recommended Production:
- 2-3 Node.js instances
- MongoDB cluster (dedicated)
- Auto-scaling enabled
- CDN for static files
- Redis for caching
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository is public/accessible
- [ ] MongoDB Atlas cluster created and URI copied
- [ ] Backend environment variables configured
- [ ] Backend deployed to Railway
- [ ] Backend URL copied
- [ ] Frontend environment variables updated
- [ ] Frontend deployed (Vercel or Railway)
- [ ] Frontend URL copied
- [ ] Backend CORS updated with frontend URL
- [ ] Test login/register works
- [ ] Test messaging works
- [ ] Test real-time updates work
- [ ] API keys configured (OpenAI, etc.)

---

## 🎓 Next Steps

1. **Monitor Performance**
   - Check Railway dashboard daily
   - Monitor error logs
   - Check database usage

2. **Optimize Database**
   - Add indexes for frequently queried fields
   - Archive old messages
   - Set up backups

3. **Improve Security**
   - Enable rate limiting
   - Set up WAF (Web Application Firewall)
   - Regular security audits
   - Enable 2FA on accounts

4. **Scale Applications**
   - Add more server instances
   - Use Redis for caching
   - Implement message queuing
   - Add CDN for static assets

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Support & Issues

If you encounter issues:

1. **Check Railway Logs** - Most issues visible in logs
2. **Verify Environment Variables** - Common source of errors
3. **Test Locally First** - Run `npm run dev` locally
4. **Check API Keys** - Ensure they're valid and not expired
5. **Review Firewall Rules** - Database access might be restricted

---

## 🎉 Success!

Once deployed, share your app:
```
Frontend: https://your-app.vercel.app
Backend API: https://your-api.railway.app
```

**ChatSphere is now live!** 🚀

---

Made with ❤️ - ChatSphere Team
