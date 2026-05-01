import { Router } from 'express';
import { SpeakerController } from '../controllers/speaker.controller';

const router = Router();

// Endpoint : GET /api/speakers
router.get('/', SpeakerController.getAllSpeakers);

export default router;