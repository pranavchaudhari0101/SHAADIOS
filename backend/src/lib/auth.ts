import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma.js'
import type { User } from '@prisma/client'

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// ============================================
// PASSWORD HASHING
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// ============================================
// JWT TOKENS
// ============================================

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

export async function authenticateUser(
  email: string, 
  password: string
): Promise<{ user: User; token: string } | null> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })
  
  if (!user) {
    return null
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return null
  }
  
  // Generate token
  const token = generateToken(user)
  
  return { user, token }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })
  
  return user
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// ============================================
// EMAIL VALIDATION
// ============================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
