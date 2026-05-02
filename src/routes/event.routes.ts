import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', eventController.getAll);
router.get('/upcoming', eventController.getUpcoming);
router.get('/:id', eventController.getOne);          
router.get('/:id/live', eventController.getCurrentLive);   
router.get('/:id/stats', eventController.getStats);       

 router.post('/', eventController.create);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);

export default router;