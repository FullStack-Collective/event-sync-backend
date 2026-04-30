import { Request, Response } from 'express';
import { roomService } from '../services/room.service';

export const roomController = {
  /**
   * GET /api/rooms
   * Récupérer toutes les salles
   */
  getAll: async (req: Request, res: Response) => {
    const rooms = await roomService.findAll();
    res.json({
      data: rooms,
      total: rooms.length
    });
  },
  
  /**
   * GET /api/rooms/:id
   * Récupérer une salle spécifique avec ses sessions
   */
  getOne: async (req: Request, res: Response) => {
    const room = await roomService.findById(parseInt(req.params.id));
    res.json({ data: room });
  },
  
  /**
   * POST /api/rooms
   * Créer une nouvelle salle (admin uniquement)
   */
  create: async (req: Request, res: Response) => {
    const room = await roomService.create(req.body);
    res.status(201).json({ data: room });
  },
  
  /**
   * PUT /api/rooms/:id
   * Modifier une salle (admin uniquement)
   */
  update: async (req: Request, res: Response) => {
    const room = await roomService.update(parseInt(req.params.id), req.body);
    res.json({ data: room });
  },
  
  /**
   * DELETE /api/rooms/:id
   * Supprimer une salle (admin uniquement)
   */
  delete: async (req: Request, res: Response) => {
    await roomService.delete(parseInt(req.params.id));
    res.status(204).send();  // 204 = No Content (succès sans réponse)
  }
};