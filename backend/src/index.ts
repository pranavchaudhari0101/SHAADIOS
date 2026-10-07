import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.routes.js'
import weddingRoutes from './routes/wedding.routes.js'
import taskRoutes from './routes/task.routes.js'
import vendorRoutes from './routes/vendor.routes.js'
import guestRoutes from './routes/guest.routes.js'
import roomRoutes from './routes/room.routes.js'
import notificationRoutes from './routes/notification.routes.js'

// Import middleware
import { errorHandler } from './middleware/error.middleware.js'

const app = express()
const PORT = process.env.PORT || 3001

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes)
app.use('/api/weddings', weddingRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/notifications', notificationRoutes)

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404
  })
})

// Global error handler
app.use(errorHandler)

// ============================================
// START SERVER
// ============================================

// For Vercel serverless, export the app
export default app

// For local development, start the server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🚀 ShaadiOS Backend Server              ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}               ║
  ║   Port: ${PORT}                              ║
  ║   API: http://localhost:${PORT}/api          ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `)
  })
}
