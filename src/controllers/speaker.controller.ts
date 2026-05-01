import { Request, Response } from 'express';
import { SpeakerService } from '../services/speaker.service';

export class SpeakerController {
    static async getAllSpeakers(req: Request, res: Response) {
        try {
            const speakers = await SpeakerService.getAll();
            return res.status(200).json(speakers);
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors de la récupération des intervenants.',
            });
        }
    }
}