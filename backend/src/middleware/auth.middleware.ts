import { Request, Response, NextFunction } from 'express'
import { getUserFromToken } from '../lib/auth.js'

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
// AUTHENTICATION MIDDLEWARE
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
    
    const user = await getUserFromToken(token)
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        statusCode: 401
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
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      statusCode: 500
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
      const user = await getUserFromToken(token)
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role
        }
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
