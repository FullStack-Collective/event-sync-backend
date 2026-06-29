import { Router } from 'express';
import { SpeakerController } from '../controllers/speaker.controller';
import {authMiddleware} from "../middleware/auth.middleware";

const router = Router();

router.get('/', SpeakerController.getAllSpeakers);
router.get('/:id', SpeakerController.getSpeakerById);
router.get('/:id/sessions', SpeakerController.getSessionsForSpeaker);

router.post('/', authMiddleware, SpeakerController.createSpeaker);
router.put('/:id', authMiddleware, SpeakerController.updateSpeaker);
router.delete('/:id', authMiddleware, SpeakerController.deleteSpeaker);
router.delete('/:speakerId/sessions/:sessionId', authMiddleware, SpeakerController.removeSessionFromSpeaker);
router.post('/:speakerId/sessions/:sessionId', authMiddleware, SpeakerController.addSessionToSpeaker);

export default router;