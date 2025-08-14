import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"

// JWT secret - in production this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const secret = new TextEncoder().encode(JWT_SECRET)

export interface AuthPayload {
  userId: string
  email: string
  role: "admin" | "judge"
  name: string
  iat?: number
  exp?: number
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Verify JWT token and return payload
 * @param token - JWT token string
 * @returns AuthPayload if valid, null if invalid
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as AuthPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

/**
 * Generate JWT token for user
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export async function generateToken(payload: Omit<AuthPayload, "iat" | "exp">): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.replace("Bearer ", "")
}
