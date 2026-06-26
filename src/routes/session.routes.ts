import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { SpeakerController } from '../controllers/speaker.controller';
import {  authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', sessionController.getAll);
router.get('/event/:eventId', sessionController.getByEvent);
router.get('/:id', sessionController.getOne);

router.post('/', authMiddleware, requireAdmin, sessionController.create);
router.put('/:id', authMiddleware, requireAdmin, sessionController.update);
router.delete('/:id', authMiddleware, requireAdmin, sessionController.delete);
router.post('/:sessionId/speakers/:speakerId', authMiddleware,SpeakerController.addSessionToSpeaker);


export default router;