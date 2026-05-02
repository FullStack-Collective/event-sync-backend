import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', sessionController.getAll);
router.get('/event/:eventId', sessionController.getByEvent);
router.get('/:id', sessionController.getOne);

router.post('/', authMiddleware, sessionController.create);
router.put('/:id', authMiddleware, sessionController.update);
router.delete('/:id', authMiddleware, sessionController.delete);

export default router;