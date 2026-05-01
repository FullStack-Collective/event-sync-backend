import { Request, Response } from 'express';
import { SpeakerService } from '../services/speaker.service';
import {parseIdParam} from "../utils/validation.util";

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
            const id = parseIdParam(req.params.id);

            if (id === null) {
                return res.status(400).json({ error: 'Identifiant invalide ou manquant dans l\'URL.' });
            }

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

    static async createSpeaker(req: Request, res: Response) {
        try {
            const speakerData = req.body;

            if (!speakerData.name) {
                return res.status(400).json({ error: 'Le champ "name" est obligatoire.' });
            }

            const newSpeaker = await SpeakerService.create(speakerData);

            return res.status(201).json(newSpeaker);
        } catch (error) {
            return res.status(500).json({ error: 'Erreur lors de la création de l\'intervenant.' });
        }
    }

    static async updateSpeaker(req: Request, res: Response) {
        try {
            const id = parseIdParam(req.params.id);

            if (id === null) {
                return res.status(400).json({ error: 'Identifiant invalide ou manquant dans l\'URL.' });
            }

            const existingSpeaker = await SpeakerService.getById(id);
            if (!existingSpeaker) {
                return res.status(404).json({ error: 'Intervenant non trouvé.' });
            }

            const speakerData = req.body;
            const updatedSpeaker = await SpeakerService.update(id, speakerData);

            return res.status(200).json(updatedSpeaker);
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors de la modification de l\'intervenant.',
            });
        }
    }

    static async deleteSpeaker(req: Request, res: Response) {
        try {
            const id = parseIdParam(req.params.id);

            if (id === null) {
                return res.status(400).json({ error: 'Identifiant invalide ou manquant dans l\'URL.' });
            }

            const existingSpeaker = await SpeakerService.getById(id);
            if (!existingSpeaker) {
                return res.status(404).json({ error: 'Intervenant non trouvé.' });
            }

            await SpeakerService.delete(id);

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors de la suppression de l\'intervenant.',
            });
        }
    }

    static async getSessionsForSpeaker(req: Request, res: Response) {
        try {
            const id = parseIdParam(req.params.id);

            if (id === null) {
                return res.status(400).json({ error: 'Identifiant invalide ou manquant dans l\'URL.' });
            }

            const existingSpeaker = await SpeakerService.getById(id);
            if (!existingSpeaker) {
                return res.status(404).json({ error: 'Intervenant non trouvé.' });
            }

            const sessions = await SpeakerService.getSessionsBySpeakerId(id);

            return res.status(200).json(sessions);
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors de la récupération des sessions de l\'intervenant.',
            });
        }
    }
}