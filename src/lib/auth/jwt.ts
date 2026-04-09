import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || import.meta.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No');

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'super_admin' | 'instructor' | 'student';
}

export function generateToken(payload: JWTPayload): string {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  console.log('🎫 Token generated for:', payload.email);
  return token;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    console.log('✅ Token verified for:', payload.email);
    return payload;
  } catch (error) {
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
