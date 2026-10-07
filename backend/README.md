# ShaadiOS Backend

Production-ready Node.js + Express + Prisma backend optimized for **Neon serverless PostgreSQL**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your Neon database URLs

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

Server runs at **http://localhost:3001**

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **AUTH** |||
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| **WEDDINGS** |||
| GET | /api/weddings | List all weddings |
| POST | /api/weddings | Create wedding |
| GET | /api/weddings/:id | Get wedding details |
| PATCH | /api/weddings/:id | Update wedding |
| DELETE | /api/weddings/:id | Delete wedding |
| **TASKS** |||
| GET | /api/tasks/wedding/:weddingId | Get all tasks |
| POST | /api/tasks/wedding/:weddingId | Create task |
| POST | /api/tasks/:id/complete | Complete task |
| POST | /api/tasks/:id/delegate | Delegate task |
| **VENDORS** |||
| GET | /api/vendors/wedding/:weddingId | Get vendors |
| POST | /api/vendors/wedding/:weddingId | Add vendor |
| PATCH | /api/vendors/:id/stage | Update vendor stage |
| **GUESTS** |||
| GET | /api/guests/wedding/:weddingId | Get guests |
| POST | /api/guests/wedding/:weddingId | Add guest |

## 🛠️ Development

```bash
# View database in Prisma Studio
npm run db:studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

## 🔐 Test Credentials

After running `npm run db:seed`:

- **Email**: rhea@example.com
- **Password**: Demo@123

## 📦 Deployment

Deploy to Vercel, Railway, or any Node.js hosting platform.

See `NEON_DEPLOYMENT.md` for detailed deployment guide.
