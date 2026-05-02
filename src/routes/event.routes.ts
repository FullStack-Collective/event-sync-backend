import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', eventController.getAll);
router.get('/upcoming', eventController.getUpcoming);
router.get('/:id', eventController.getOne);          
router.get('/:id/live', eventController.getCurrentLive);   
router.get('/:id/stats', eventController.getStats);       

 router.post('/',authMiddleware, eventController.create);
router.put('/:id',authMiddleware, eventController.update);
router.delete('/:id',authMiddleware, eventController.delete);

export default router;