# 🚀 Deployment Guide: Vercel + Railway + Neon

Complete step-by-step guide to deploy your Calorie Tracker app.

## 📋 Prerequisites

- GitHub account
- [Vercel account](https://vercel.com) (sign up with GitHub)
- [Railway account](https://railway.app) (sign up with GitHub)
- [Neon account](https://neon.tech) (sign up with GitHub)
- OpenAI API key
- Google OAuth credentials

---

## 🗄️ Step 1: Set Up Database (Neon)

### 1.1 Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign in with GitHub
2. Click **"Create a project"**
3. Configure:
   - **Project name**: `calorie-tracker-db`
   - **Region**: Choose closest to you
   - **Postgres version**: Latest (16+)
4. Click **"Create project"**

### 1.2 Get Connection String

1. In your Neon dashboard, click on your project
2. Go to **"Connection Details"**
3. Copy the **"Connection string"** - it looks like:
   ```
   postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require
   ```
4. Save this for later (you'll need it for Railway)

### 1.3 Run Database Migrations

On your local machine:

```bash
cd server

# Update .env with your Neon connection string
# DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

✅ Your database is now ready!

---

## 🚂 Step 2: Deploy Backend (Railway)

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `calorie-tracker` repository
5. Click **"Deploy Now"**

### 2.2 Configure Root Directory

1. In Railway dashboard, click on your service
2. Go to **"Settings"**
3. Under **"Build"**, set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

### 2.3 Add Environment Variabl

1. Go to **"Variables"** tab
2. Click **"New Variable"** and add these:

```bash
# Database (from Neon)
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Server Config
NODE_ENV=production
PORT=3001
```

### 2.4 Deploy and Get URL

1. Click **"Deploy"** (if not auto-deployed)
2. Wait for build to complete (2-3 minutes)
3. Once deployed, go to **"Settings"** → **"Networking"**
4. Click **"Generate Domain"**
5. Copy your Railway URL (e.g., `https://calorie-tracker-production.up.railway.app`)

✅ Your backend is now live!

---

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Prepare Environment Variables

First, update your local `client/.env`:

```bash
# Use your Railway backend URL
VITE_API_URL=https://calorie-tracker-production.up.railway.app/api

# Your Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

### 3.2 Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? calorie-tracker
# - Directory? ./ (current directory)
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables in Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add these:

```bash
VITE_API_URL=https://calorie-tracker-production.up.railway.app/api
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

4. Click **"Deploy"** to redeploy with new variables

### 3.4 Get Your Vercel URL

1. Once deployed, copy your Vercel URL (e.g., `https://calorie-tracker.vercel.app`)
2. **Important**: Update Railway's `FRONTEND_URL` variable with this URL

✅ Your frontend is now live!

---

## 🔐 Step 4: Configure Google OAuth

### 4.1 Update Authorized URLs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Update **Authorized JavaScript origins**:
   ```
   https://calorie-tracker.vercel.app
   https://calorie-tracker-production.up.railway.app
   ```
4. Update **Authorized redirect URIs**:
   ```
   https://calorie-tracker.vercel.app/auth/callback
   https://calorie-tracker-production.up.railway.app/api/auth/google/callback
   ```
5. Click **"Save"**

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Your App

1. Visit your Vercel URL: `https://calorie-tracker.vercel.app`
2. Try signing in with Google
3. Log a food item
4. Check if data persists

### 5.2 Check Backend Health

Visit: `https://your-backend.up.railway.app/api/health`

Should return: `{ "status": "ok" }`

### 5.3 Monitor Logs

**Railway Logs**:

1. Go to Railway dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. View real-time logs

**Vercel Logs**:

1. Go to Vercel dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click on latest deployment → View logs

---

## 🔄 Continuous Deployment

Both Vercel and Railway are now connected to your GitHub repository:

- **Push to `main` branch** → Auto-deploys to production
- **Push to other branches** → Creates preview deployments

---

## 💰 Cost Breakdown

| Service     | Free Tier                          | Your Usage         |
| ----------- | ---------------------------------- | ------------------ |
| **Neon**    | 10 projects, 3GB storage           | ✅ Free            |
| **Railway** | $5 credit/month                    | ✅ Free (~$3-4/mo) |
| **Vercel**  | 100GB bandwidth, unlimited deploys | ✅ Free            |
| **Total**   | **$0/month**                       | 🎉                 |

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Connection refused**

```bash
# Check Railway environment variables
# Ensure DATABASE_URL is correct
# Check Railway logs for errors
```

**Error: Google OAuth failed**

```bash
# Verify FRONTEND_URL in Railway matches Vercel URL
# Check Google Console authorized URLs
# Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
```

### Frontend Issues

**Error: Network request failed**

```bash
# Check VITE_API_URL points to Railway backend
# Verify Railway backend is running
# Check browser console for CORS errors
```

**Error: Google Sign-In not working**

```bash
# Verify VITE_GOOGLE_CLIENT_ID is correct
# Check Google Console authorized origins
```

### Database Issues

**Error: Prisma migration failed**

```bash
# Verify DATABASE_URL is correct
# Check Neon dashboard for database status
# Try running: npx prisma migrate deploy
```

---

## 📚 Useful Commands

```bash
# View Railway logs
railway logs

# View Vercel logs
vercel logs

# Redeploy Railway
railway up

# Redeploy Vercel
vercel --prod

# Run Prisma migrations on production
npx prisma migrate deploy

# View Neon database
npx prisma studio
```

---

## 🎉 Success!

Your app is now deployed and accessible at:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **Database**: Neon Postgres

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] Google OAuth URLs are configured
- [ ] JWT_SECRET is a strong random string (32+ chars)
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] CORS is properly configured in backend
- [ ] No secrets committed to GitHub

---

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Configure Vercel Analytics (optional)
3. Set up error monitoring (Sentry, LogRocket)
4. Enable Railway metrics and alerts
5. Set up backup strategy for Neon database

Happy deploying! 🎊
