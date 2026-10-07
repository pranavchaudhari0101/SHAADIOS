# 🚀 Deploy ShaadiOS to Vercel

You need to deploy **TWO SEPARATE Vercel projects**:

---

## Project 1: Backend API (Node.js)

### Root Directory: `backend`

### Environment Variables (Vercel Dashboard → Settings → Environment Variables):
```
DATABASE_URL=postgresql://neondb_owner:npg_pqI10skZiEPC@ep-tiny-dew-b5futi81-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DIRECT_URL=postgresql://neondb_owner:npg_pqI10skZiEPC@ep-tiny-dew-b5futi81-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=ShaadiOS2026ProductionSecretKey!@#$RandomString32Chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend.vercel.app
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Build Settings:
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## Project 2: Frontend (React)

### Root Directory: (leave blank for root)

### Environment Variables:
```
VITE_API_URL=https://your-backend.vercel.app/api
```

### Build Settings:
- **Root Directory**: (blank - root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 🔄 After Both Deployments

Update your frontend `.env` with the backend URL:
```
VITE_API_URL=https://shaadios-backend.vercel.app/api
```

Update `backend/.env` with your frontend URL:
```
CORS_ORIGIN=https://shaadios-frontend.vercel.app
```

---

## 📊 Your API Endpoints Will Be:

```
https://shaadios-backend.vercel.app/api/auth/login
https://shaadios-backend.vercel.app/api/weddings
https://shaadios-backend.vercel.app/api/tasks/wedding/:id
https://shaadios-backend.vercel.app/api/health
```

---

## ⚠️ Important Notes

1. **Deploy backend FIRST** - You'll need the backend URL for frontend
2. **Keep `.env` files local** - They're in `.gitignore` and should never be committed
3. **Environment variables in Vercel** - These are encrypted and secure
