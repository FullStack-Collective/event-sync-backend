import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', roomController.getAll);
router.get('/:id', roomController.getOne);

router.post('/', authMiddleware, requireAdmin, roomController.create);
router.put('/:id', authMiddleware, requireAdmin, roomController.update);
router.delete('/:id', authMiddleware, requireAdmin, roomController.delete);

export default router;