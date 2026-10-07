# ShaadiOS Production Setup Guide

## Current State
- Frontend: React + Vite (working prototype)
- Data Storage: localStorage (browser-only, not persistent across devices)
- No backend, no database, no authentication

---

## Phase 1: Backend API & Database Setup

### Option A: Node.js + Express + PostgreSQL (Recommended)

#### Tech Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ (Supabase, Railway, or Neon)
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **File Storage**: AWS S3 or Cloudflare R2
- **Email**: Resend / SendGrid
- **SMS/WhatsApp**: Twilio / Gupshup

#### Database Schema (Core Tables)

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR,
  phone VARCHAR,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Weddings
weddings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  partner1_name VARCHAR,
  partner2_name VARCHAR,
  city VARCHAR,
  wedding_date DATE,
  guest_count INTEGER,
  budget_amount DECIMAL,
  template_id VARCHAR,
  ceremonies JSONB,
  status VARCHAR DEFAULT 'planning',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tasks
tasks (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  owner_id UUID REFERENCES users(id),
  due_date DATE,
  status VARCHAR,
  priority VARCHAR,
  category VARCHAR,
  depends_on UUID[],
  blocks UUID[],
  notes JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Vendors
vendors (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR,
  category VARCHAR,
  state VARCHAR,
  contact_person VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  amount DECIMAL,
  milestones JSONB,
  notes TEXT,
  created_at TIMESTAMP
)

-- Guests
guests (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR,
  side VARCHAR,
  group_name VARCHAR,
  relation VARCHAR,
  party_size INTEGER,
  rsvp_status VARCHAR,
  events JSONB,
  dietary VARCHAR,
  phone VARCHAR,
  city VARCHAR,
  notes TEXT
)

-- Rooms
rooms (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  room_number VARCHAR,
  type VARCHAR,
  capacity INTEGER,
  wing VARCHAR,
  assigned_guest_ids UUID[],
  status VARCHAR,
  check_in DATE,
  check_out DATE
)

-- Notifications
notifications (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR,
  description TEXT,
  type VARCHAR,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- Activity Log
activity_log (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings(id),
  user_id UUID REFERENCES users(id),
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMP
)
```

---

## Phase 2: Authentication System

### Features Needed
- [ ] Email/Password signup
- [ ] Email verification
- [ ] Login with JWT tokens
- [ ] Password reset via email
- [ ] OAuth (Google, Apple) - optional
- [ ] Session management
- [ ] Role-based access (owner, co-owner, family_lead, coordinator)

### Implementation

```javascript
// Example auth middleware
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

---

## Phase 3: API Endpoints

### Auth Routes
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Wedding Routes
```
GET    /api/weddings              # List user's weddings
POST   /api/weddings              # Create new wedding
GET    /api/weddings/:id          # Get wedding details
PUT    /api/weddings/:id          # Update wedding
DELETE /api/weddings/:id          # Delete wedding
```

### Task Routes
```
GET    /api/weddings/:id/tasks
POST   /api/weddings/:id/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
POST   /api/tasks/:id/delegate
```

### Vendor Routes
```
GET    /api/weddings/:id/vendors
POST   /api/weddings/:id/vendors
PUT    /api/vendors/:id
DELETE /api/vendors/:id
PUT    /api/vendors/:id/stage
```

### Guest & Room Routes
```
GET    /api/weddings/:id/guests
POST   /api/weddings/:id/guests
PUT    /api/guests/:id
DELETE /api/guests/:id
GET    /api/weddings/:id/rooms
PUT    /api/rooms/:id/assign
```

### Export/Import Routes
```
GET    /api/weddings/:id/export   # JSON backup
POST   /api/weddings/:id/import   # Restore from backup
```

---

## Phase 4: Third-Party Integrations

### WhatsApp Business API
- **Provider**: Twilio, Gupshup, or Wati
- **Use Cases**: 
  - Send task reminders
  - Vendor follow-up templates
  - Guest coordination
  - Family updates

```javascript
// Example using Twilio
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)

export async function sendWhatsApp(to, message) {
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: message
  })
}
```

### Payment Gateway (Razorpay - India)
```javascript
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
})

export async function createPaymentOrder(amount, weddingId, vendorId) {
  return razorpay.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    notes: { weddingId, vendorId }
  })
}
```

### Email Service (Resend)
```javascript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to, subject, html) {
  await resend.emails.send({
    from: 'ShaadiOS <noreply@shaadios.com>',
    to,
    subject,
    html
  })
}
```

---

## Phase 5: File Storage

### AWS S3 Setup
```javascript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
})

export async function uploadFile(key, body, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: 'shaadios-uploads',
    Key: key,
    Body: body,
    ContentType: contentType
  }))
}

export async function getSignedUploadUrl(key, expiresIn = 3600) {
  return getSignedUrl(s3, new PutObjectCommand({
    Bucket: 'shaadios-uploads',
    Key: key
  }), { expiresIn })
}
```

### File Types to Store
- Vendor contracts (PDF)
- Venue layout blueprints
- Decor moodboards
- Guest photos
- Invitation proofs

---

## Phase 6: Deployment

### Recommended Platform: Vercel + Supabase

#### Frontend (Vercel)
1. Push code to GitHub
2. Connect Vercel to repo
3. Set environment variables
4. Auto-deploys on push to main

#### Backend Options:

**Option A: Supabase (Recommended)**
- PostgreSQL database (free tier: 500MB)
- Built-in auth
- Storage for files
- Real-time subscriptions
- Edge functions for API

**Option B: Railway**
- PostgreSQL + Node.js on same platform
- Easy deployment from GitHub
- $5/month starter

**Option C: DigitalOcean App Platform**
- Managed Node.js + PostgreSQL
- $5/month basic tier

**Option D: Self-hosted VPS**
- Ubuntu + Docker + Nginx
- Full control, manual maintenance
- ₹500-1000/month (DigitalOcean/Hetzner)

### Environment Variables (Production)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/shaadios"

# Auth
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRES_IN="7d"

# Third-Party Services
TWILIO_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_WHATSAPP_FROM="+14155238886"

RAZORPAY_KEY_ID="rzp_live_xxx"
RAZORPAY_KEY_SECRET="xxx"

RESEND_API_KEY="re_xxx"

AWS_ACCESS_KEY_ID="AKIAxxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="shaadios-uploads"

# Frontend
NEXT_PUBLIC_API_URL="https://api.shaadios.com"
```

---

## Phase 7: Security & Compliance

### Data Protection
- [ ] HTTPS everywhere (SSL/TLS)
- [ ] Encrypt sensitive data at rest
- [ ] Hash passwords with bcrypt (cost factor 12)
- [ ] Sanitize all inputs
- [ ] Rate limiting on API endpoints
- [ ] CORS configuration

### Privacy (India DPDP Act)
- [ ] Privacy policy page
- [ ] Terms of service
- [ ] Cookie consent banner
- [ ] Data deletion on request
- [ ] User data export feature

### Backup Strategy
- [ ] Daily database backups
- [ ] Point-in-time recovery
- [ ] Cross-region backup replication
- [ ] Backup restoration testing

---

## Quick Start Commands

### 1. Initialize Backend
```bash
mkdir shaadios-backend
cd shaadios-backend
npm init -y
npm install express cors helmet morgan
npm install prisma @prisma/client
npm install jsonwebtoken bcryptjs
npm install zod dotenv
npm install @aws-sdk/client-s3
npm install resend
npm install twilio
npm install razorpay
npm install -D typescript @types/node tsx
```

### 2. Setup Prisma
```bash
npx prisma init
# Edit prisma/schema.prisma with above schema
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Create Express Server
```bash
touch src/index.ts src/routes.ts src/auth.ts src/middleware.ts
```

### 4. Deploy to Supabase
```bash
# Create Supabase project at supabase.com
# Copy DATABASE_URL from project settings
npx prisma migrate deploy
```

### 5. Deploy to Vercel
```bash
# Frontend
cd ../
vercel deploy --prod

# Backend (if using Vercel functions)
cd shaadios-backend
vercel deploy --prod
```

---

## Estimated Costs (Monthly)

### Minimal Setup (0-100 users)
- Supabase Free: $0
- Vercel Free: $0
- Resend Free: $0 (3k emails)
- Twilio: Pay as you go
- **Total: ₹0-500/month**

### Growth Stage (100-1000 users)
- Supabase Pro: $25
- Vercel Pro: $20
- Resend Pro: $20
- AWS S3: $5
- **Total: ₹5,000-6,000/month**

### Scale Stage (1000+ users)
- Supabase Team: $599
- Vercel Team: $40
- Dedicated services
- **Total: ₹50,000+/month**

---

## Next Steps

1. **Choose deployment platform** (Supabase recommended)
2. **Set up PostgreSQL database** (Supabase free tier)
3. **Create backend API** (Express or Next.js API routes)
4. **Implement authentication**
5. **Migrate frontend to use API instead of localStorage**
6. **Add WhatsApp integration**
7. **Deploy to production**

Would you like me to proceed with any specific phase?
