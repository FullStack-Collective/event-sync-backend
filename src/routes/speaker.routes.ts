import { Router } from 'express';
import { SpeakerController } from '../controllers/speaker.controller';
import {authMiddleware} from "../middleware/auth.middleware";

const router = Router();

router.get('/', SpeakerController.getAllSpeakers);
router.get('/:id', SpeakerController.getSpeakerById);
router.post('/', authMiddleware, SpeakerController.createSpeaker);
router.get('/:id/sessions', SpeakerController.getSessionsForSpeaker);

router.put('/:id', SpeakerController.updateSpeaker);
router.delete('/:id', SpeakerController.deleteSpeaker);


export default router;