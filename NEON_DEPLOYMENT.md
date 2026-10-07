# ShaadiOS Backend - Neon PostgreSQL Setup Guide

This backend is optimized for **Neon serverless PostgreSQL** with Prisma ORM.

## 🚀 Quick Start

### 1. Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up (free tier: 0.5GB storage, 100 hours compute/month)
3. Create a new project named `shaadios`
4. Choose a region close to you (e.g., `US East (Ohio)` or `Asia Pacific (Singapore)`)

### 2. Get Database URLs

From your Neon dashboard, copy:
- **Connection string** → This goes in `DATABASE_URL`
- **Pooled connection string** → This goes in `DIRECT_URL`

Example:
```
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/shaadios?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/shaadios?sslmode=require"
```

### 3. Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your Neon database URLs
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate Prisma Client

```bash
npm run db:generate
```

### 6. Run Migrations

```bash
npm run db:migrate
```

This will create all tables in your Neon database:
- ✅ `users` - User accounts
- ✅ `weddings` - Wedding plans
- ✅ `tasks` - Wedding tasks
- ✅ `vendors` - Vendor management
- ✅ `guests` - Guest list
- ✅ `rooms` - Room assignments
- ✅ `notifications` - Alerts & reminders
- ✅ `activity_log` - Activity history

### 7. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3001`

## 📊 Database Schema

### Core Tables

```
┌─────────────┐
│   users     │
├─────────────┤
│ id          │
│ email       │
│ passwordHash│
│ fullName    │
│ phone       │
│ role        │
└──────┬──────┘
       │
       │ owns
       ▼
┌─────────────┐
│  weddings   │
├─────────────┤
│ id          │
│ ownerId     │
│ couple      │
│ city        │
│ date        │
│ guestCount  │
│ budgetAmount│
│ ceremonies  │
└──────┬──────┘
       │
       ├─────────────┬──────────────┬─────────────┐
       │             │              │             │
       ▼             ▼              ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  tasks   │  │ vendors  │  │ guests   │  │  rooms   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## 🔧 API Endpoints

### Auth
```
POST   /api/auth/register       # Create account
POST   /api/auth/login          # Login
GET    /api/auth/me             # Get current user
PATCH  /api/auth/me             # Update profile
POST   /api/auth/logout         # Logout
```

### Weddings
```
GET    /api/weddings                    # List all weddings
POST   /api/weddings                    # Create wedding
GET    /api/weddings/:id                # Get wedding details
PATCH  /api/weddings/:id                # Update wedding
DELETE /api/weddings/:id                # Delete wedding
POST   /api/weddings/:id/collaborators  # Invite collaborator
GET    /api/weddings/:id/export         # Export as JSON
```

### Tasks
```
GET    /api/tasks/wedding/:weddingId    # Get all tasks
POST   /api/tasks/wedding/:weddingId    # Create task
GET    /api/tasks/:id                   # Get task details
PATCH  /api/tasks/:id                   # Update task
POST   /api/tasks/:id/complete          # Complete task
POST   /api/tasks/:id/delegate          # Delegate task
DELETE /api/tasks/:id                   # Delete task
```

### Vendors
```
GET    /api/vendors/wedding/:weddingId  # Get all vendors
POST   /api/vendors/wedding/:weddingId  # Add vendor
PATCH  /api/vendors/:id/stage           # Update stage
```

### Guests
```
GET    /api/guests/wedding/:weddingId   # Get all guests
POST   /api/guests/wedding/:weddingId   # Add guest
PATCH  /api/guests/:id                  # Update guest
DELETE /api/guests/:id                  # Remove guest
```

### Rooms
```
GET    /api/rooms/wedding/:weddingId    # Get all rooms
POST   /api/rooms/wedding/:weddingId    # Add room
PATCH  /api/rooms/:id/assign            # Assign guest
```

### Notifications
```
GET    /api/notifications/wedding/:weddingId   # Get notifications
PATCH  /api/notifications/:id/read             # Mark as read
POST   /api/notifications/wedding/:weddingId/read-all  # Mark all read
```

## 🧪 Testing the API

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rhea@example.com",
    "password": "SecurePass123",
    "fullName": "Rhea Kapoor",
    "phone": "+91 98201 11223"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rhea@example.com",
    "password": "SecurePass123"
  }'
```

### Create Wedding
```bash
curl -X POST http://localhost:3001/api/weddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "partner1Name": "Rhea Kapoor",
    "partner2Name": "Arjun Mehta",
    "couple": "Rhea & Arjun",
    "city": "Jaipur",
    "date": "2027-02-18T00:00:00.000Z",
    "isoDate": "2027-02-18",
    "guestCount": 280,
    "budgetAmount": 2400000,
    "templateId": "north_indian",
    "ceremonies": ["Mehendi", "Haldi", "Sangeet", "Wedding", "Reception"]
  }'
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT authentication (7-day expiry)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Rate limiting (100 requests per 15 min)
- ✅ Input validation with Zod
- ✅ Role-based access control

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect Vercel to repo
3. Set environment variables in Vercel dashboard
4. Deploy!

```bash
vercel deploy --prod
```

### Environment Variables (Production)

```env
DATABASE_URL="your-neon-db-url"
DIRECT_URL="your-neon-direct-url"
JWT_SECRET="your-256-bit-secret"
NODE_ENV="production"
FRONTEND_URL="https://your-frontend.com"
CORS_ORIGIN="https://your-frontend.com"
```

## 💰 Neon Pricing

| Tier    | Storage | Compute     | Price |
|---------|---------|-------------|-------|
| Free    | 0.5 GB  | 100 hrs/mo  | $0    |
| Pro     | 10 GB   | 300 hrs/mo  | $19/mo|
| Scale   | 50 GB   | Unlimited   | $69/mo|

Free tier is perfect for development and small weddings!

## 🔍 Database Management

### View Data in Prisma Studio
```bash
npm run db:studio
```
Opens at `http://localhost:5555`

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

## 📱 Next Steps

1. **Connect Frontend**: Update your React app to use these API endpoints
2. **Add WhatsApp**: Integrate Twilio/Gupshup for real messaging
3. **Add Payments**: Integrate Razorpay for vendor payments
4. **Add File Uploads**: Integrate AWS S3 for contracts & photos
5. **Deploy**: Push to Vercel + Neon for production

## 🆘 Troubleshooting

### "Can't reach database server"
- Check if Neon project is active (free tier sleeps after inactivity)
- Verify DATABASE_URL is correct
- Ensure `?sslmode=require` is in the connection string

### "Prisma Client not generated"
```bash
npm run db:generate
```

### "Migration failed"
```bash
# Reset and try again
npx prisma migrate reset
```

## 📚 Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com)

---

**Built for ShaadiOS** - The operating system for Indian weddings 🪷
