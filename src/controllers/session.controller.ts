import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';

export const sessionController = {
  /**
   * GET /api/sessions
   * Récupérer toutes les sessions
   */
  getAll: async (req: Request, res: Response) => {
    const sessions = await sessionService.findAll();
    res.json({
      data: sessions,
      total: sessions.length
    });
  },
  
  /**
   * GET /api/sessions/:id
   * Récupérer une session spécifique
   */
  getOne: async (req: Request, res: Response) => {
    const session = await sessionService.findById(parseInt(req.params.id));
    res.json({ data: session });
  },
  
  /**
   * GET /api/events/:eventId/sessions
   * Récupérer toutes les sessions d'un événement
   */
  getByEvent: async (req: Request, res: Response) => {
    const sessions = await sessionService.findByEvent(parseInt(req.params.eventId));
    res.json({
      data: sessions,
      total: sessions.length
    });
  },
  
  /**
   * POST /api/sessions
   * Créer une nouvelle session (admin uniquement)
   */
  create: async (req: Request, res: Response) => {
    const session = await sessionService.create(req.body);
    res.status(201).json({ data: session });
  },
  
  /**
   * PUT /api/sessions/:id
   * Modifier une session (admin uniquement)
   */
  update: async (req: Request, res: Response) => {
    const session = await sessionService.update(parseInt(req.params.id), req.body);
    res.json({ data: session });
  },
  
  /**
   * DELETE /api/sessions/:id
   * Supprimer une session (admin uniquement)
   */
  delete: async (req: Request, res: Response) => {
    await sessionService.delete(parseInt(req.params.id));
    res.status(204).send();
  }
};