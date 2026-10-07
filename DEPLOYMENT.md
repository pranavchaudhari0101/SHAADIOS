# 🚀 ShaadiOS Backend Deployment Guide

Complete guide to deploy your backend to production with Neon PostgreSQL.

---

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ Neon account (free at [neon.tech](https://neon.tech))
- ✅ GitHub account
- ✅ Backend code ready

---

## 🎯 Recommended: Deploy to Vercel (Easiest)

Vercel provides zero-config deployments with excellent free tier.

### Step 1: Push to GitHub

```bash
cd c:\Users\Admin\Desktop\Shaadios\backend

# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial backend setup for ShaadiOS"

# Create GitHub repo and push
# Option A: Using GitHub CLI
gh repo create shaadios-backend --public --source=. --push

# Option B: Manual
# 1. Go to github.com → New repository
# 2. Name it "shaadios-backend"
# 3. Don't initialize with README
# 4. Run:
git remote add origin https://github.com/YOUR_USERNAME/shaadios-backend.git
git branch -M main
git push -u origin main
```

### Step 2: Get Neon Database URLs

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create new project: `shaadios-production`
3. Select region: Choose closest to your users
4. Copy both connection strings:
   - **Connection string** (with `?sslmode=require`)
   - **Pooled connection string** (with `?sslmode=require&pgbouncer=true`)

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your `shaadios-backend` repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (click "Environment Variables"):

```
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/shaadios?sslmode=require&pgbouncer=true

DIRECT_URL=postgresql://username:password@ep-xxx.neon.tech/shaadios?sslmode=require

JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-random-string

JWT_EXPIRES_IN=7d

NODE_ENV=production

FRONTEND_URL=https://your-frontend.vercel.app

CORS_ORIGIN=https://your-frontend.vercel.app
```

6. Click **"Deploy"**
7. Wait 2-3 minutes for deployment

### Step 4: Run Database Migrations

After deployment succeeds:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations in production
vercel env pull .env.production.local
npx prisma migrate deploy
```

Or use Prisma Studio via Vercel:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1`
4. Redeploy

### Step 5: Get Your API URL

Your backend will be live at:
```
https://shaadios-backend.vercel.app
```

Test it:
```bash
curl https://shaadios-backend.vercel.app/health
```

---

## 🚂 Alternative: Deploy to Railway

Railway provides simple deployments with built-in database options.

### Step 1: Push to GitHub (same as Vercel)

### Step 2: Deploy

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `shaadios-backend`

### Step 3: Add Environment Variables

In Railway dashboard:
1. Click your service
2. Go to **"Variables"** tab
3. Add all variables from `.env.example`

### Step 4: Configure Build Settings

Railway auto-detects Node.js, but verify:
- **Build Command**: `npm run build && npx prisma generate`
- **Start Command**: `npm start`

### Step 5: Get Your URL

Railway provides a URL like:
```
https://shaadios-backend-production.up.railway.app
```

---

## 🐳 Advanced: Deploy with Docker

### Option A: DigitalOcean App Platform

1. Push code to GitHub
2. Go to [DigitalOcean](https://www.digitalocean.com)
3. Create App Platform app
4. Connect GitHub repo
5. Configure:
   - **Type**: Web Service
   - **Dockerfile Path**: `./Dockerfile`
   - **HTTP Port**: 3001
6. Add environment variables
7. Deploy ($5/month)

### Option B: Self-hosted VPS

```bash
# On your server (Ubuntu)
git clone https://github.com/YOUR_USERNAME/shaadios-backend.git
cd shaadios-backend

# Create .env file
nano .env
# Add your Neon URLs and secrets

# Install Docker
curl -fsSL https://get.docker.com | sh

# Deploy
docker-compose up -d

# Setup nginx reverse proxy
apt install nginx
nano /etc/nginx/sites-available/shaadios-api
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.shaadios.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/shaadios-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL with Let's Encrypt
apt install certbot python3-certbot-nginx
certbot --nginx -d api.shaadios.com
```

---

## 🗄️ Database Setup

### Run Migrations

**Local (with Neon):**
```bash
cd backend
npm run db:migrate
```

**Production (after deployment):**

Option 1: Local migration to production database
```bash
# Set production DATABASE_URL in .env
npx prisma migrate deploy
```

Option 2: Use Vercel CLI
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Seed Demo Data

```bash
npm run db:seed
```

### View Data in Prisma Studio

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] **Health check works**: `https://your-api.vercel.app/health`
- [ ] **Register works**: POST `/api/auth/register`
- [ ] **Login works**: POST `/api/auth/login`
- [ ] **Database connected**: Create a wedding
- [ ] **CORS configured**: Frontend can call API
- [ ] **Environment variables set**: All secrets in Vercel/Railway

---

## 🔧 Troubleshooting

### "Can't reach database server"
- Neon free tier sleeps after inactivity
- First request may take 2-3 seconds to wake up
- Ensure `?sslmode=require` is in connection string

### "Prisma Client not generated"
```bash
# Add to build script in package.json:
"build": "prisma generate && tsc"
```

### "JWT_SECRET not found"
- Add `JWT_SECRET` to environment variables
- Must be at least 32 characters

### CORS errors
- Add `CORS_ORIGIN` with your frontend URL
- Include protocol: `https://your-frontend.vercel.app`

### "Rate limit exceeded"
- Default is 100 requests per 15 minutes
- Increase in `.env`: `RATE_LIMIT_MAX=1000`

---

## 📊 Monitoring

### Vercel Logs
1. Go to Vercel dashboard
2. Click your project
3. Go to "Deployments" → Click deployment → "Logs"

### Railway Logs
1. Railway dashboard
2. Click service → "Logs" tab

### Add Logging (Optional)
```typescript
// In src/index.ts
import pino from 'pino'

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
})
```

---

## 🔐 Security Best Practices

1. **Never commit .env files** ✅ (already in .gitignore)
2. **Use strong JWT_SECRET** (32+ random characters)
3. **Enable rate limiting** (already configured)
4. **Validate all inputs** (using Zod)
5. **Use HTTPS only** (Vercel/Railway handle this)
6. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 🚀 Recommended Deployment Path

**For beginners:**
```
GitHub → Vercel + Neon (Free, easiest)
```

**For production:**
```
GitHub → Railway + Neon ($5/month, more control)
```

**For full control:**
```
GitHub → DigitalOcean VPS + Docker ($5-10/month)
```

---

## 📱 Connect Frontend

After backend is deployed, update your frontend:

```javascript
// In src/core/api.js (create this file)
const API_URL = 'https://shaadios-backend.vercel.app/api'

export async function register(email, password, fullName) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName })
  })
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}
```

---

## 🎉 You're Live!

Your backend is now deployed and connected to Neon PostgreSQL!

**Next steps:**
1. Test all API endpoints
2. Connect your frontend
3. Add WhatsApp integration
4. Add Razorpay payments
5. Set up monitoring & alerts

---

**Need help?** Check the logs, verify environment variables, and ensure database migrations ran successfully.
