import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', roomController.getAll);
router.get('/:id', roomController.getOne);

router.post('/', authMiddleware, roomController.create);
router.put('/:id', authMiddleware, roomController.update);
router.delete('/:id', authMiddleware, roomController.delete);

export default router;