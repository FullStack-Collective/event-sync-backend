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

    static async getSpeakerById(req: Request, res: Response) {
        try {
            const idParam = req.params.id as string;

            if (!idParam) {
                return res.status(400).json({ error: 'Identifiant manquant dans l\'URL.' });
            }

            const id = parseInt(idParam, 10);

            const speaker = await SpeakerService.getById(id);

            if (!speaker) {
                return res.status(404).json({ error: 'Intervenant non trouvé.' });
            }

            return res.status(200).json(speaker);
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors de la récupération de l\'intervenant.',
            });
        }
    }
}