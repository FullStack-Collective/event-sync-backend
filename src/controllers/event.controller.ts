import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { createEventSchema, updateEventSchema, eventQuerySchema } from '../schemas/event.schema';
import { ValidationError } from '../utils/errors';

const extractId = (param: string | string[]): number => {
  const idString = Array.isArray(param) ? param[0] : param;
  return parseInt(idString);
};

export const eventController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const queryParams = eventQuerySchema.parse(req.query);
      const result = await eventService.findAll(queryParams);
      return res.json({ success: true, ...result });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Erreur interne' });
    }
  },

  getUpcoming: async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const events = await eventService.findUpcoming(limit);
      return res.json({ success: true, data: events, count: events.length });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  },

  getOne: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError('Id invalide');
      }
      const event = await eventService.findById(id);
      return res.json({ success: true, data: event });
    } catch (error) {
      const status = (error as any).statusCode || 500;
      return res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  getCurrentLive: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError('Id invalide');
      }
      const liveSession = await eventService.findCurrentLiveSession(id);
      if (!liveSession) {
        return res.json({ success: true, data: null, message: 'Aucune session en cours' });
      }
      return res.json({ success: true, data: liveSession, isLive: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError('ID invalide');
      }
      const stats = await eventService.getStats(id);
      return res.json({ success: true, data: stats });
    } catch (error) {
      const status = (error as any).statusCode || 500;
      return res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const validatedData = createEventSchema.parse(req.body);
      const event = await eventService.create(validatedData);
      return res.status(201).json({ success: true, data: event, message: 'Événement créé avec succès' });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Erreur interne' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError('ID invalide');
      }
      const validatedData = updateEventSchema.parse(req.body);
      const event = await eventService.update(id, validatedData);
      return res.json({ success: true, data: event, message: 'Événement modifié avec succès' });
    } catch (error) {
      const status = (error as any).statusCode || 400;
      return res.status(status).json({ success: false, error: (error as Error).message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        throw new ValidationError('ID invalide');
      }
      await eventService.delete(id);
      return res.status(204).send();
    } catch (error) {
      const status = (error as any).statusCode || 400;
      return res.status(status).json({ success: false, error: (error as Error).message });
    }
  }
};