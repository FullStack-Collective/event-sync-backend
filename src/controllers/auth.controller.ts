import { Request, Response } from 'express';
import { loginAdmin, logoutAdmin, verifyAdminToken } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }
    
    const result = await loginAdmin({ email, password });
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    return res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};


export const logout = async (req: Request, res: Response) => {
  try {
    const result = logoutAdmin();
    
    return res.status(200).json({
      success: true,
      message: result.message,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};


export const verify = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'No token provided',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    const result = await verifyAdminToken(token);
    
    if (!result.valid) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Invalid or expired token',
      });
    }
    
    return res.status(200).json({
      success: true,
      valid: true,
      user: result.user,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      valid: false,
      error: 'Token verification failed',
    });
  }
};