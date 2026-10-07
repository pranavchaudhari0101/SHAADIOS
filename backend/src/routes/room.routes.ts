import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// GET ROOMS BY WEDDING
// ============================================

router.get('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const rooms = await prisma.room.findMany({
    where: { weddingId: req.params.weddingId },
    orderBy: { roomNumber: 'asc' }
  })
  
  res.json({ rooms })
})

// ============================================
// CREATE ROOM
// ============================================

router.post('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const {
    roomNumber,
    type,
    capacity,
    wing,
    checkIn,
    checkOut
  } = req.body
  
  const room = await prisma.room.create({
    data: {
      weddingId: req.params.weddingId,
      roomNumber,
      type,
      capacity: capacity || 2,
      wing,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status: 'AVAILABLE'
    }
  })
  
  res.status(201).json({
    message: 'Room added successfully',
    room
  })
})

// ============================================
// ASSIGN GUEST TO ROOM
// ============================================

router.patch('/:id/assign', requireAuth, async (req: Request, res: Response) => {
  const { guestId, shouldAssign } = req.body
  
  if (!guestId) {
    throw new AppError('Guest ID is required', 400)
  }
  
  const room = await prisma.room.findUnique({
    where: { id: req.params.id }
  })
  
  if (!room) {
    throw new AppError('Room not found', 404)
  }
  
  const currentGuestIds = room.assignedGuestIds || []
  let updatedGuestIds: string[]
  
  if (shouldAssign) {
    // Add guest
    updatedGuestIds = [...new Set([...currentGuestIds, guestId])]
  } else {
    // Remove guest
    updatedGuestIds = currentGuestIds.filter(id => id !== guestId)
  }
  
  // Update room
  const updatedRoom = await prisma.room.update({
    where: { id: req.params.id },
    data: {
      assignedGuestIds: updatedGuestIds,
      status: updatedGuestIds.length > 0 ? 'OCCUPIED' : 'AVAILABLE'
    }
  })
  
  // Update guest
  await prisma.guest.update({
    where: { id: guestId },
    data: {
      roomAssigned: shouldAssign ? room.roomNumber : null
    }
  })
  
  res.json({
    message: shouldAssign ? 'Guest assigned to room' : 'Guest unassigned from room',
    room: updatedRoom
  })
})

export default router
