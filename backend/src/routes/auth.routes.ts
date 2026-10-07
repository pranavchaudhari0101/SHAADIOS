import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { clerkAuthMiddleware, requireClerkAuth } from '../middleware/clerk.auth.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional()
})

// ============================================
// GET CURRENT USER (Requires Clerk Auth)
// ============================================

router.get('/me', requireClerkAuth, async (req: Request, res: Response) => {
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
// UPDATE PROFILE (Requires Clerk Auth)
// ============================================

router.patch('/me', requireClerkAuth, async (req: Request, res: Response) => {
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
        statusCode: 400,
        details: error.errors
      })
    }
    throw error
  }
})

// ============================================
// LOGOUT (Client-side token removal)
// ============================================

router.post('/logout', (req: Request, res: Response) => {
  res.json({ 
    message: 'Logged out successfully. Remove token from client storage.' 
  })
})

export default router
