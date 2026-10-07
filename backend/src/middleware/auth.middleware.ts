import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '@clerk/backend'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
}

// ============================================
// CLERK AUTH MIDDLEWARE (Replaces JWT-based requireAuth)
// ============================================

export async function requireAuth(
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
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify token with Clerk
    const { sub: userId } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: ['http://localhost:3001', 'https://shaadios-backend.vercel.app']
    })
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        statusCode: 401
      })
    }
    
    // Get user from Clerk
    const { createClerkClient } = await import('@clerk/backend')
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })
    
    const clerkUser = await clerkClient.users.getUser(userId)
    
    // Create or get user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    
    if (!user) {
      // Create new user from Clerk data
      user = await prisma.user.create({
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
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
      statusCode: 401
    })
  }
}

// ============================================
// OPTIONAL AUTH (doesn't fail if no token)
// ============================================

export async function optionalAuth(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        const { sub: userId } = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
          authorizedParties: ['http://localhost:3001', 'https://shaadios-backend.vercel.app']
        })
        
        if (userId) {
          const { createClerkClient } = await import('@clerk/backend')
          const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY
          })
          
          const clerkUser = await clerkClient.users.getUser(userId)
          
          let user = await prisma.user.findUnique({
            where: { clerkId: userId }
          })
          
          if (!user) {
            user = await prisma.user.create({
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
          }
          
          req.user = {
            id: user.id,
            email: user.email,
            role: user.role
          }
        }
      } catch {
        // Ignore auth errors - continue without user
      }
    }
    
    next()
  } catch (error) {
    // Continue without user
    next()
  }
}

// ============================================
// ROLE-BASED ACCESS CONTROL
// ============================================

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401
      })
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        statusCode: 403
      })
    }
    
    next()
  }
}
