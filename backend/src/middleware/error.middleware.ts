import { Request, Response, NextFunction } from 'express'

// ============================================
// CUSTOM ERROR CLASS
// ============================================

export class AppError extends Error {
  statusCode: number
  status: string
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// ============================================
// ERROR HANDLER
// ============================================

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.status,
      message: err.message,
      statusCode: err.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
  }

  // Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A record with this value already exists',
        statusCode: 409
      })
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Record not found',
        statusCode: 404
      })
    }
  }

  // Validation errors (Zod)
  if (err.constructor.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      statusCode: 400,
      details: (err as any).errors
    })
  }

  // JWT errors
  if (err.constructor.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
      statusCode: 401
    })
  }

  if (err.constructor.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired',
      statusCode: 401
    })
  }

  // Default error
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
