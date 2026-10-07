import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

// ============================================
// GET NOTIFICATIONS
// ============================================

router.get('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const { unreadOnly } = req.query
  
  const notifications = await prisma.notification.findMany({
    where: {
      weddingId: req.params.weddingId,
      OR: [
        { userId: req.user!.id },
        { userId: null } // General notifications
      ],
      ...(unreadOnly === 'true' && { read: false })
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  
  res.json({ notifications })
})

// ============================================
// MARK AS READ
// ============================================

router.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: {
      read: true,
      readAt: new Date()
    }
  })
  
  res.json({
    message: 'Notification marked as read',
    notification
  })
})

// ============================================
// MARK ALL AS READ
// ============================================

router.post('/wedding/:weddingId/read-all', requireAuth, async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: {
      weddingId: req.params.weddingId,
      OR: [
        { userId: req.user!.id },
        { userId: null }
      ],
      read: false
    },
    data: {
      read: true,
      readAt: new Date()
    }
  })
  
  res.json({ message: 'All notifications marked as read' })
})

export default router
