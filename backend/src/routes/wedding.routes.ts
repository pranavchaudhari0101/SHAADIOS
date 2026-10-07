import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createWeddingSchema = z.object({
  partner1Name: z.string().min(1, 'Partner 1 name is required'),
  partner2Name: z.string().min(1, 'Partner 2 name is required'),
  couple: z.string().min(1, 'Couple display name is required'),
  city: z.string().min(1, 'City is required'),
  date: z.string().transform(v => new Date(v)),
  isoDate: z.string(),
  season: z.string().optional(),
  guestCount: z.number().int().positive().default(300),
  budgetAmount: z.number().positive().default(0),
  templateId: z.string(),
  ceremonies: z.array(z.string())
})

const updateWeddingSchema = z.object({
  partner1Name: z.string().min(1).optional(),
  partner2Name: z.string().min(1).optional(),
  couple: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  date: z.string().transform(v => new Date(v)).optional(),
  isoDate: z.string().optional(),
  season: z.string().optional(),
  guestCount: z.number().int().positive().optional(),
  budgetAmount: z.number().positive().optional(),
  ceremonies: z.array(z.string()).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
})

// ============================================
// GET ALL WEDDINGS FOR CURRENT USER
// ============================================

router.get('/', requireAuth, async (req: Request, res: Response) => {
  const weddings = await prisma.wedding.findMany({
    where: {
      OR: [
        { ownerId: req.user!.id },
        {
          collaborators: {
            some: { userId: req.user!.id }
          }
        }
      ]
    },
    include: {
      collaborators: {
        select: {
          id: true,
          role: true,
          user: {
            select: { id: true, fullName: true, email: true }
          }
        }
      },
      _count: {
        select: {
          tasks: true,
          vendors: true,
          guests: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  res.json({ weddings })
})

// ============================================
// GET SINGLE WEDDING
// ============================================

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { ownerId: req.user!.id },
        {
          collaborators: {
            some: { userId: req.user!.id }
          }
        }
      ]
    },
    include: {
      collaborators: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true }
          }
        }
      },
      tasks: {
        orderBy: { createdAt: 'asc' }
      },
      vendors: {
        orderBy: { createdAt: 'asc' }
      },
      guests: {
        orderBy: { createdAt: 'asc' }
      },
      rooms: {
        orderBy: { roomNumber: 'asc' }
      },
      notifications: {
        where: { read: false },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      contingency: true
    }
  })
  
  if (!wedding) {
    throw new AppError('Wedding not found or access denied', 404)
  }
  
  res.json({ wedding })
})

// ============================================
// CREATE WEDDING
// ============================================

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = createWeddingSchema.parse(req.body)
    
    const wedding = await prisma.wedding.create({
      data: {
        ownerId: req.user!.id,
        partner1Name: body.partner1Name,
        partner2Name: body.partner2Name,
        couple: body.couple,
        city: body.city,
        date: body.date,
        isoDate: body.isoDate,
        season: body.season,
        guestCount: body.guestCount,
        budgetAmount: body.budgetAmount,
        templateId: body.templateId,
        ceremonies: body.ceremonies,
        status: 'PLANNING'
      },
      include: {
        collaborators: true
      }
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        weddingId: wedding.id,
        userId: req.user!.id,
        action: `Created wedding plan for ${body.couple}`,
        metadata: { templateId: body.templateId }
      }
    })
    
    res.status(201).json({
      message: 'Wedding created successfully',
      wedding
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.errors
      })
    }
    throw error
  }
})

// ============================================
// UPDATE WEDDING
// ============================================

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const body = updateWeddingSchema.parse(req.body)
    
    // Check ownership
    const existing = await prisma.wedding.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user!.id
      }
    })
    
    if (!existing) {
      throw new AppError('Wedding not found or access denied', 404)
    }
    
    const wedding = await prisma.wedding.update({
      where: { id: req.params.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })
    
    res.json({
      message: 'Wedding updated successfully',
      wedding
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.errors
      })
    }
    throw error
  }
})

// ============================================
// DELETE WEDDING
// ============================================

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  // Only owner can delete
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: req.params.id,
      ownerId: req.user!.id
    }
  })
  
  if (!wedding) {
    throw new AppError('Wedding not found or access denied', 404)
  }
  
  await prisma.wedding.delete({
    where: { id: req.params.id }
  })
  
  res.json({
    message: 'Wedding and all associated data deleted successfully'
  })
})

// ============================================
// INVITE COLLABORATOR
// ============================================

router.post('/:id/collaborators', requireAuth, async (req: Request, res: Response) => {
  const { email, role } = req.body
  
  if (!email || !role) {
    throw new AppError('Email and role are required', 400)
  }
  
  // Check if user owns the wedding
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: req.params.id,
      ownerId: req.user!.id
    }
  })
  
  if (!wedding) {
    throw new AppError('Wedding not found or access denied', 404)
  }
  
  // Find user to invite
  const userToInvite = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })
  
  if (!userToInvite) {
    throw new AppError('User with this email not found', 404)
  }
  
  // Check if already a collaborator
  const existing = await prisma.weddingCollaborator.findUnique({
    where: {
      weddingId_userId: {
        weddingId: req.params.id,
        userId: userToInvite.id
      }
    }
  })
  
  if (existing) {
    throw new AppError('User is already a collaborator', 409)
  }
  
  // Add collaborator
  const collaborator = await prisma.weddingCollaborator.create({
    data: {
      weddingId: req.params.id,
      userId: userToInvite.id,
      role,
      invitedBy: req.user!.id,
      invitedAt: new Date(),
      acceptedAt: new Date() // Auto-accept for now
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true }
      }
    }
  })
  
  res.status(201).json({
    message: 'Collaborator invited successfully',
    collaborator
  })
})

// ============================================
// EXPORT WEDDING DATA
// ============================================

router.get('/:id/export', requireAuth, async (req: Request, res: Response) => {
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { ownerId: req.user!.id },
        { collaborators: { some: { userId: req.user!.id } } }
      ]
    },
    include: {
      tasks: true,
      vendors: true,
      guests: true,
      rooms: true,
      contingency: true,
      notifications: true
    }
  })
  
  if (!wedding) {
    throw new AppError('Wedding not found or access denied', 404)
  }
  
  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="shaadios-backup-${wedding.couple.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json"`
  )
  
  res.json({
    exportedAt: new Date().toISOString(),
    version: '1.0',
    wedding
  })
})

export default router
