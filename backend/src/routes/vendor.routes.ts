import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// GET VENDORS BY WEDDING
// ============================================

router.get('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const vendors = await prisma.vendor.findMany({
    where: { weddingId: req.params.weddingId },
    orderBy: [
      { state: 'asc' },
      { createdAt: 'desc' }
    ]
  })
  
  res.json({ vendors })
})

// ============================================
// CREATE VENDOR
// ============================================

router.post('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const {
    name,
    category,
    contactPerson,
    phone,
    email,
    website,
    amount,
    holdDeadline,
    relatedTaskId,
    inclusions,
    milestones,
    notes
  } = req.body
  
  // Verify access
  const hasAccess = await prisma.wedding.findFirst({
    where: {
      id: req.params.weddingId,
      OR: [
        { ownerId: req.user!.id },
        { collaborators: { some: { userId: req.user!.id } } }
      ]
    }
  })
  
  if (!hasAccess) {
    throw new AppError('Access denied', 403)
  }
  
  const vendor = await prisma.vendor.create({
    data: {
      weddingId: req.params.weddingId,
      name,
      category,
      contactPerson,
      phone,
      email,
      website,
      amount,
      holdDeadline: holdDeadline ? new Date(holdDeadline) : null,
      relatedTaskId,
      inclusions,
      milestones,
      notes
    }
  })
  
  res.status(201).json({
    message: 'Vendor added successfully',
    vendor
  })
})

// ============================================
// UPDATE VENDOR STAGE
// ============================================

router.patch('/:id/stage', requireAuth, async (req: Request, res: Response) => {
  const { state } = req.body
  
  if (!state) {
    throw new AppError('State is required', 400)
  }
  
  const vendor = await prisma.vendor.findUnique({
    where: { id: req.params.id },
    include: { wedding: { select: { ownerId: true } } }
  })
  
  if (!vendor) {
    throw new AppError('Vendor not found', 404)
  }
  
  // Verify access
  const hasAccess = vendor.wedding.ownerId === req.user!.id ||
    await prisma.weddingCollaborator.findFirst({
      where: { weddingId: vendor.weddingId, userId: req.user!.id }
    })
  
  if (!hasAccess) {
    throw new AppError('Access denied', 403)
  }
  
  const updatedVendor = await prisma.vendor.update({
    where: { id: req.params.id },
    data: {
      state,
      confirmedAt: state === 'CONFIRMED' ? new Date() : null
    }
  })
  
  // If confirmed and has related task, complete it
  if (state === 'CONFIRMED' && vendor.relatedTaskId) {
    await prisma.task.update({
      where: { id: vendor.relatedTaskId },
      data: {
        status: 'DONE',
        priority: 'DONE',
        completedAt: new Date()
      }
    })
  }
  
  res.json({
    message: 'Vendor stage updated',
    vendor: updatedVendor
  })
})

export default router
