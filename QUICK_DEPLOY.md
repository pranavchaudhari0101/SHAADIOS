# ⚡ Quick Deploy Guide - ShaadiOS Backend

Follow these steps to deploy your backend in under 10 minutes.

---

## 🎯 Step 1: Setup Neon Database (2 minutes)

1. Go to **https://neon.tech** → Sign up (free)
2. Create new project:
   - Name: `shaadios`
   - Region: Choose closest to you
3. Copy connection strings:
   - **Pooled connection** → This is your `DATABASE_URL`
   - **Direct connection** → This is your `DIRECT_URL`

Both should look like:
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/shaadios?sslmode=require
```

---

## 🔧 Step 2: Configure Backend (2 minutes)

Open PowerShell in the backend directory:

```powershell
cd c:\Users\Admin\Desktop\Shaadios\backend

# Copy environment template
copy .env.example .env

# Edit with your values
notepad .env
```

Replace these lines in `.env`:
```env
DATABASE_URL="your-neon-pooled-connection-string"
DIRECT_URL="your-neon-direct-connection-string"
JWT_SECRET="make-up-a-32-character-random-string-here"
```

---

## 📦 Step 3: Install & Build (2 minutes)

```powershell
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:migrate

# Add demo data (optional)
npm run db:seed
```

---

## ✅ Step 4: Test Locally (1 minute)

```powershell
# Start server
npm run dev
```

Open another PowerShell:
```powershell
# Test health endpoint
curl http://localhost:3001/health

# Or run full test suite
.\test-api.ps1
```

You should see:
```json
{
  "status": "ok",
  "environment": "development"
}
```

---

## 🚀 Step 5: Deploy to Vercel (3 minutes)

### Option A: Use the deployment script

```powershell
.\deploy.ps1
```

Choose option `1` for Vercel and follow the prompts.

### Option B: Manual deployment

1. **Push to GitHub:**
```powershell
git init
git add .
git commit -m "Initial ShaadiOS backend"
git remote add origin https://github.com/YOUR_USERNAME/shaadios-backend.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to **https://vercel.com** → Sign up with GitHub
   - Click **"Add New Project"**
   - Import `shaadios-backend` repo
   - Add environment variables (from your `.env` file):
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `JWT_SECRET`
     - `NODE_ENV=production`
   - Click **"Deploy"**

3. **Run migrations:**
```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations in production
npx prisma migrate deploy
```

---

## 🎉 Step 6: Verify Deployment

Your API is now live at:
```
https://shaadios-backend.vercel.app
```

Test it:
```powershell
# Health check
curl https://shaadios-backend.vercel.app/health

# Register user
curl -X POST https://shaadios-backend.vercel.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test@123","fullName":"Test User"}'

# Login with demo account (if you seeded)
curl -X POST https://shaadios-backend.vercel.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"rhea@example.com","password":"Demo@123"}'
```

---

## 🔗 Next: Connect Frontend

Update your React app to use the API:

```javascript
// In src/lib/api.js (create this file)
const API_URL = 'https://shaadios-backend.vercel.app/api'

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

## 📊 Platform Comparison

| Platform | Free Tier | Pros | Best For |
|----------|-----------|------|----------|
| **Vercel** | ✅ Yes | Zero-config, auto SSL | Frontend + Serverless |
| **Railway** | ✅ $5 credit | Easy DB, more control | Full-stack apps |
| **DigitalOcean** | ❌ $5/mo | Full VPS control | Production scale |

---

## 🆘 Troubleshooting

### "Cannot reach database"
- Check `DATABASE_URL` is correct
- Ensure `?sslmode=require` is in the URL
- Neon free tier sleeps - first request may be slow

### "JWT_SECRET not found"
- Add `JWT_SECRET` to Vercel environment variables
- Must be at least 32 characters

### "Prisma Client not generated"
- Add to build script: `"build": "prisma generate && tsc"`

### "CORS error"
- Add `CORS_ORIGIN` with your frontend URL
- Include `https://` prefix

---

## 🎯 Quick Commands Reference

```powershell
# Development
npm run dev              # Start dev server
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:seed          # Add demo data

# Testing
.\test-api.ps1           # Test all endpoints
curl http://localhost:3001/health  # Quick health check

# Deployment
.\deploy.ps1             # Interactive deployment
vercel deploy --prod     # Deploy to Vercel

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
```

---

## ✨ You're Done!

Your ShaadiOS backend is now:
- ✅ Connected to Neon PostgreSQL
- ✅ Deployed to Vercel/Railway
- ✅ Secured with JWT authentication
- ✅ Ready for production use

**Next steps:**
1. Connect your React frontend
2. Add WhatsApp integration (Twilio)
3. Add payment gateway (Razorpay)
4. Set up file uploads (AWS S3)

---

**Need help?** Check `DEPLOYMENT.md` for detailed guides.
