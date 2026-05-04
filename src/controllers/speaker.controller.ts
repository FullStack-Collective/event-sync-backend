import { Request, Response } from 'express';
import { SpeakerService } from '../services/speaker.service';
import {parseIdParam} from "../utils/validation.util";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    static async removeSessionFromSpeaker(req: Request, res: Response) {
        try {
            const speakerId = parseIdParam(req.params.speakerId);
            const sessionId = parseIdParam(req.params.sessionId);

            if (speakerId === null || sessionId === null) {
                return res.status(400).json({
                    error: 'Identifiant(s) de l\'intervenant ou de la session invalide(s).'
                });
            }

            const existingLink = await prisma.sessionSpeaker.findUnique({
                where: {
                    sessionId_speakerId: {
                        speakerId,
                        sessionId,
                    }
                }
            });

            if (!existingLink) {
                return res.status(404).json({
                    error: 'L\'intervenant n\'est pas associé à cette session.'
                });
            }

            await SpeakerService.removeSession(speakerId, sessionId);

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors du retrait de l\'intervenant de la session.',
            });
        }
    }

    static async addSessionToSpeaker(req: Request, res: Response) {
        try {
            const sessionId = parseIdParam(req.params.sessionId);
            const speakerId = parseIdParam(req.params.speakerId);

            if (speakerId === null || sessionId === null) {
                return res.status(400).json({
                    error: 'Identifiant(s) de l\'intervenant ou de la session invalide(s).'
                });
            }

            // 1. Vérification de l'existence du Speaker
            const speakerExists = await SpeakerService.getById(speakerId);
            if (!speakerExists) {
                return res.status(404).json({ error: 'Intervenant non trouvé.' });
            }

            const sessionExists = await prisma.session.findUnique({
                where: { id: sessionId }
            });
            if (!sessionExists) {
                return res.status(404).json({ error: 'Session non trouvée.' });
            }

            const existingLink = await prisma.sessionSpeaker.findUnique({
                where: {
                    sessionId_speakerId: {
                        sessionId,
                        speakerId
                    }
                }
            });

            if (existingLink) {
                return res.status(409).json({
                    error: 'L\'intervenant est déjà associé à cette session.'
                });
            }

            // 4. Création de l'association
            const newLink = await SpeakerService.addSession(speakerId, sessionId);

            return res.status(201).json(newLink);
        } catch (error) {
            return res.status(500).json({
                error: 'Erreur lors de l\'ajout de l\'intervenant à la session.',
            });
        }
    }
}