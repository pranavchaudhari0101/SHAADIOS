import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// GET GUESTS BY WEDDING
// ============================================

router.get('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const guests = await prisma.guest.findMany({
    where: { weddingId: req.params.weddingId },
    orderBy: [
      { side: 'asc' },
      { rsvpStatus: 'asc' },
      { createdAt: 'desc' }
    ]
  })
  
  res.json({ guests })
})

// ============================================
// CREATE GUEST
// ============================================

router.post('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const {
    name,
    side,
    groupName,
    relation,
    partySize,
    phone,
    email,
    city,
    rsvpStatus,
    events,
    stayRequired,
    dietary,
    notes
  } = req.body
  
  const guest = await prisma.guest.create({
    data: {
      weddingId: req.params.weddingId,
      name,
      side: side || 'MUTUAL',
      groupName,
      relation,
      partySize: partySize || 1,
      phone,
      email,
      city,
      rsvpStatus: rsvpStatus || 'PENDING',
      events,
      stayRequired: stayRequired || false,
      dietary,
      notes
    }
  })
  
  res.status(201).json({
    message: 'Guest added successfully',
    guest
  })
})

// ============================================
// UPDATE GUEST
// ============================================

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const guest = await prisma.guest.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      updatedAt: new Date()
    }
  })
  
  res.json({
    message: 'Guest updated successfully',
    guest
  })
})

// ============================================
// DELETE GUEST
// ============================================

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await prisma.guest.delete({
    where: { id: req.params.id }
  })
  
  res.json({ message: 'Guest removed successfully' })
})

export default router
