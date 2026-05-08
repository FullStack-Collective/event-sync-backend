import { generateToken, JWTPayload, verifyToken } from '../lib/jwt';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@eventsync.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const ADMIN_USER = {
  id: 1,
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  role: 'admin' as const,
  name: 'Administrator',
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
  expiresIn: string;
}

export interface VerifyResponse {
  valid: boolean;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function loginAdmin(credentials: LoginRequest): Promise<LoginResponse> {
  const { email, password } = credentials;
  
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw new Error('Invalid email or password');
  }
  
  const payload: JWTPayload = {
    id: ADMIN_USER.id,
    email: ADMIN_USER.email,
    role: ADMIN_USER.role,
  };
  
  const token = generateToken(payload);
  
  return {
    token,
    user: {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      role: ADMIN_USER.role,
      name: ADMIN_USER.name,
    },
    expiresIn: '24h',
  };
}

export async function verifyAdminToken(token: string): Promise<VerifyResponse> {
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { valid: false };
  }
  
  if (decoded.email !== ADMIN_EMAIL) {
    return { valid: false };
  }
  
  return {
    valid: true,
    user: {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    },
  };
}

export function logoutAdmin(): { success: boolean; message: string } {
  return {
    success: true,
    message: 'Logged out successfully',
  };
}