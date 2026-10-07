import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { 
  hashPassword, 
  authenticateUser, 
  generateToken,
  validateEmail,
  validatePassword 
} from '../lib/auth.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// VALIDATION SCHEMAS
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional()
})

// ============================================
// REGISTER
// ============================================

router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate input
    const body = registerSchema.parse(req.body)
    
    // Validate password strength
    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.errors.join('. '), 400)
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() }
    })
    
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409)
    }
    
    // Hash password
    const passwordHash = await hashPassword(body.password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        fullName: body.fullName,
        phone: body.phone,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    })
    
    // Generate token
    const token = generateToken({
      ...user,
      passwordHash: '',
      avatarUrl: null,
      emailVerified: false,
      updatedAt: new Date()
    } as any)
    
    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors
      })
    }
    throw error
  }
})

// ============================================
// LOGIN
// ============================================

router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)
    
    // Authenticate user
    const result = await authenticateUser(body.email, body.password)
    
    if (!result) {
      throw new AppError('Invalid email or password', 401)
    }
    
    const { user, token } = result
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerified: user.emailVerified
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors
      })
    }
    throw error
  }
})

// ============================================
// GET CURRENT USER
// ============================================

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      ownedWeddings: {
        select: {
          id: true,
          couple: true,
          city: true,
          date: true,
          status: true
        }
      },
      collaborations: {
        select: {
          role: true,
          wedding: {
            select: {
              id: true,
              couple: true,
              city: true,
              date: true,
              status: true
            }
          }
        }
      }
    }
  })
  
  if (!user) {
    throw new AppError('User not found', 404)
  }
  
  res.json({ user })
})

// ============================================
// UPDATE PROFILE
// ============================================

router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = updateProfileSchema.parse(req.body)
    
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        updatedAt: true
      }
    })
    
    res.json({
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors
      })
    }
    throw error
  }
})

// ============================================
// LOGOUT (client-side token removal)
// ============================================

router.post('/logout', (req: Request, res: Response) => {
  res.json({ 
    message: 'Logged out successfully. Remove token from client storage.' 
  })
})

export default router
