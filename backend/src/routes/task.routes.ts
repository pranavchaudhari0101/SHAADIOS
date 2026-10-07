import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error.middleware.js'

const router = Router()

// ============================================
// GET TASKS BY WEDDING
// ============================================

router.get('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  // Verify access
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: req.params.weddingId,
      OR: [
        { ownerId: req.user!.id },
        { collaborators: { some: { userId: req.user!.id } } }
      ]
    }
  })
  
  if (!wedding) {
    throw new AppError('Wedding not found or access denied', 404)
  }
  
  const tasks = await prisma.task.findMany({
    where: { weddingId: req.params.weddingId },
    include: {
      owner: {
        select: { id: true, fullName: true, email: true }
      }
    },
    orderBy: [
      { priority: 'asc' },
      { dueDate: 'asc' }
    ]
  })
  
  res.json({ tasks })
})

// ============================================
// GET SINGLE TASK
// ============================================

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id },
    include: {
      wedding: {
        select: { id: true, ownerId: true }
      },
      owner: {
        select: { id: true, fullName: true, email: true }
      }
    }
  })
  
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  
  // Verify access
  const hasAccess = task.wedding.ownerId === req.user!.id ||
    await prisma.weddingCollaborator.findFirst({
      where: {
        weddingId: task.wedding.id,
        userId: req.user!.id
      }
    })
  
  if (!hasAccess) {
    throw new AppError('Access denied', 403)
  }
  
  res.json({ task })
})

// ============================================
// CREATE TASK
// ============================================

router.post('/wedding/:weddingId', requireAuth, async (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    ceremony,
    dueDate,
    dueIsoDate,
    status,
    priority,
    dependsOn,
    blocks
  } = req.body
  
  // Verify access
  const wedding = await prisma.wedding.findFirst({
    where: {
      id: req.params.weddingId,
      OR: [
        { ownerId: req.user!.id },
        { collaborators: { some: { userId: req.user!.id, role: { in: ['OWNER', 'CO_OWNER', 'FAMILY_LEAD'] } } } }
      ]
    }
  })
  
  if (!wedding) {
    throw new AppError('Wedding not found or access denied', 404)
  }
  
  const task = await prisma.task.create({
    data: {
      weddingId: req.params.weddingId,
      title,
      description,
      category,
      ceremony,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueIsoDate,
      status: status || 'NOT_STARTED',
      priority: priority || 'UPCOMING',
      dependsOn: dependsOn || [],
      blocks: blocks || [],
      ownerId: req.user!.id
    },
    include: {
      owner: {
        select: { id: true, fullName: true }
      }
    }
  })
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      weddingId: req.params.weddingId,
      userId: req.user!.id,
      action: `Created task "${title}"`,
      metadata: { taskId: task.id }
    }
  })
  
  res.status(201).json({
    message: 'Task created successfully',
    task
  })
})

// ============================================
// UPDATE TASK
// ============================================

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { wedding: { select: { ownerId: true } } }
  })
  
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  
  // Verify access
  const hasAccess = task.wedding.ownerId === req.user!.id ||
    await prisma.weddingCollaborator.findFirst({
      where: { weddingId: task.weddingId, userId: req.user!.id }
    })
  
  if (!hasAccess) {
    throw new AppError('Access denied', 403)
  }
  
  const updatedTask = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      updatedAt: new Date()
    }
  })
  
  res.json({
    message: 'Task updated successfully',
    task: updatedTask
  })
})

// ============================================
// COMPLETE TASK
// ============================================

router.post('/:id/complete', requireAuth, async (req: Request, res: Response) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { wedding: { select: { ownerId: true, couple: true } } }
  })
  
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  
  // Verify access
  const hasAccess = task.wedding.ownerId === req.user!.id ||
    await prisma.weddingCollaborator.findFirst({
      where: { weddingId: task.weddingId, userId: req.user!.id }
    })
  
  if (!hasAccess) {
    throw new AppError('Access denied', 403)
  }
  
  const updatedTask = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      status: 'DONE',
      priority: 'DONE',
      completedAt: new Date()
    }
  })
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      weddingId: task.weddingId,
      userId: req.user!.id,
      action: `Completed task "${task.title}"`,
      metadata: { taskId: task.id }
    }
  })
  
  // Create notification for blocked tasks
  const blockedTasks = await prisma.task.findMany({
    where: {
      weddingId: task.weddingId,
      dependsOn: { has: task.id }
    }
  })
  
  if (blockedTasks.length > 0) {
    await prisma.notification.createMany({
      data: blockedTasks.map(t => ({
        weddingId: task.weddingId,
        userId: t.ownerId,
        title: `Unblocked: ${t.title}`,
        description: `Prerequisite "${task.title}" completed. Work can now safely begin.`,
        type: 'ACTION',
        taskId: t.id
      }))
    })
  }
  
  res.json({
    message: 'Task completed successfully',
    task: updatedTask,
    unblockedTasks: blockedTasks.map(t => t.title)
  })
})

// ============================================
// DELEGATE TASK
// ============================================

router.post('/:id/delegate', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req.body
  
  if (!userId) {
    throw new AppError('User ID is required', 400)
  }
  
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { wedding: { select: { ownerId: true } } }
  })
  
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  
  // Verify access
  const hasAccess = task.wedding.ownerId === req.user!.id ||
    await prisma.weddingCollaborator.findFirst({
      where: {
        weddingId: task.weddingId,
        userId: req.user!.id,
        role: { in: ['OWNER', 'CO_OWNER'] }
      }
    })
  
  if (!hasAccess) {
    throw new AppError('Access denied', 403)
  }
  
  // Verify user is a collaborator
  const collaborator = await prisma.weddingCollaborator.findFirst({
    where: { weddingId: task.weddingId, userId }
  })
  
  if (!collaborator && task.wedding.ownerId !== userId) {
    throw new AppError('User is not a collaborator on this wedding', 400)
  }
  
  const updatedTask = await prisma.task.update({
    where: { id: req.params.id },
    data: { ownerId: userId },
    include: {
      owner: { select: { id: true, fullName: true } }
    }
  })
  
  // Create notification
  await prisma.notification.create({
    data: {
      weddingId: task.weddingId,
      userId,
      title: `Task assigned: ${task.title}`,
      description: `You have been assigned to "${task.title}"`,
      type: 'ACTION',
      taskId: task.id
    }
  })
  
  res.json({
    message: 'Task delegated successfully',
    task: updatedTask
  })
})

// ============================================
// DELETE TASK
// ============================================

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { wedding: { select: { ownerId: true } } }
  })
  
  if (!task) {
    throw new AppError('Task not found', 404)
  }
  
  // Only owner can delete
  if (task.wedding.ownerId !== req.user!.id) {
    throw new AppError('Only wedding owner can delete tasks', 403)
  }
  
  await prisma.task.delete({
    where: { id: req.params.id }
  })
  
  res.json({ message: 'Task deleted successfully' })
})

export default router
