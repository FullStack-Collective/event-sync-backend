import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', roomController.getAll);
router.get('/:id', roomController.getOne);

router.post('/', authMiddleware, roomController.create);
router.put('/:id', authMiddleware, roomController.update);   // Modifier une salle
router.delete('/:id', authMiddleware, roomController.delete); // Supprimer une salle

export default router;