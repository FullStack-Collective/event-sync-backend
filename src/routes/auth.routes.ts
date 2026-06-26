import { Router } from 'express';
import { login, logout, verify } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);

router.get('/verify', authMiddleware, verify);

export default router;