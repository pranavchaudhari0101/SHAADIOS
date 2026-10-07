# 🚀 ShaadiOS Backend Deployment Guide

Your backend is ready! Here's how to deploy it to Vercel.

---

## ✅ What's Already Done

### Local Setup
- ✅ Neon PostgreSQL database connected
- ✅ Database tables created
- ✅ Demo data seeded
- ✅ API server tested and running
- ✅ All authentication working

### Git Setup
- ✅ Frontend repo: `https://github.com/pranavchaudhari0101/SHAADIOS`
- ✅ Backend files committed and ready to push

---

## 📋 Deployment Steps

### Step 1: Create Backend GitHub Repository

Go to GitHub and create a new repository:
- **Name**: `shaadios-backend`
- **Public**: Yes (for Vercel integration)
- **Don't** initialize with README

After creating, copy the clone URL and run:

```powershell
cd c:\Users\Admin\Desktop\Shaadios\backend
git remote set-url origin https://github.com/YOUR_USERNAME/shaadios-backend.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your `shaadios-backend` repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

Copy and paste these in Vercel dashboard:

```env
DATABASE_URL=postgresql://neondb_owner:npg_3jcfnTWhgm8i@ep-tiny-dew-b5futi81-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://neondb_owner:npg_3jcfnTWhgm8i@ep-tiny-dew-b5futi81-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=ShaadiOS2026ProductionSecretKey!@#$RandomString32Chars

JWT_EXPIRES_IN=7d

BCRYPT_ROUNDS=12

NODE_ENV=production

PORT=3001

FRONTEND_URL=https://your-frontend-url.vercel.app

CORS_ORIGIN=https://your-frontend-url.vercel.app

RATE_LIMIT_MAX=100

RATE_LIMIT_WINDOW_MS=900000
```

### Step 4: Deploy

Click **"Deploy"** and wait for completion.

### Step 5: Run Database Migrations

After deployment, run:

```bash
vercel login
vercel link
npx prisma migrate deploy
```

### Step 6: Test Your API

Your backend will be live at:
```
https://shaadios-backend.vercel.app
```

Test:
```bash
curl https://shaadios-backend.vercel.app/health
```

---

## 🔑 Vercel Environment Variables (Copy Below)

```
DATABASE_URL=postgresql://neondb_owner:npg_3jcfnTWhgm8i@ep-tiny-dew-b5futi81-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://neondb_owner:npg_3jcfnTWhgm8i@ep-tiny-dew-b5futi81-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=ShaadiOS2026ProductionSecretKey!@#$RandomString32Chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ORIGIN=https://your-frontend-url.vercel.app
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## 🎯 Test Credentials (After Seed)

```
Email: rhea@example.com
Password: Demo@123
```

---

## 📱 Next Steps

1. **Deploy frontend** to Vercel
2. **Connect frontend** to use `/api` endpoints
3. **Add real API keys** for WhatsApp, Payments, Email later

---

**Your backend is 90% ready! Just need to push to GitHub and deploy to Vercel.**
