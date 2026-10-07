import { Request, Response, NextFunction } from 'express'
import { clerkClient, auth } from '@clerk/backend'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      clerkUser?: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        imageUrl?: string
        publicMetadata?: Record<string, unknown>
      }
    }
  }
}

// ============================================
// CLERK MIDDLEWARE - Extract user from JWT token
// ============================================

export async function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get Clerk session JWT token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
        statusCode: 401
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify token with Clerk
    const { userId, sessionClaims } = await clerkClient.tokens.verifyToken(token, {
      authorizedParties: ['http://localhost:3001', 'https://shaadios-backend.vercel.app']
    })
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: 401
      })
    }
    
    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId)
    
    req.clerkUser = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      publicMetadata: clerkUser.publicMetadata
    }
    
    // Create or update user in our database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    
    if (!existingUser) {
      // Create new user from Clerk data
      const user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          phone: clerkUser.phoneNumbers[0]?.phoneNumber,
          role: 'USER',
          emailVerified: true,
          avatarUrl: clerkUser.imageUrl
        }
      })
      
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      }
    } else {
      req.user = {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      }
    }
    
    next()
  } catch (error) {
    console.error('Clerk auth middleware error:', error)
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      statusCode: 401
    })
  }
}

// ============================================
// REQUIRE CLERK AUTH
// ============================================

export async function requireClerkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
        statusCode: 401
      })
    }
    
    const token = authHeader.substring(7)
    
    const { userId } = await clerkClient.tokens.verifyToken(token, {
      authorizedParties: ['http://localhost:3001', 'https://shaadios-backend.vercel.app']
    })
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        statusCode: 401
      })
    }
    
    const clerkUser = await clerkClient.users.getUser(userId)
    
    req.clerkUser = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      publicMetadata: clerkUser.publicMetadata
    }
    
    // Create or get user in database
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        avatarUrl: clerkUser.imageUrl,
        updatedAt: new Date()
      },
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        phone: clerkUser.phoneNumbers[0]?.phoneNumber,
        role: 'USER',
        emailVerified: true,
        avatarUrl: clerkUser.imageUrl
      }
    })
    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }
    
    next()
  } catch (error) {
    console.error('Require clerk auth error:', error)
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
      statusCode: 401
    })
  }
}
