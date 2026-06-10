import { Request, Response } from 'express';
import { eventService } from '../services/event.service';

const extractId = (param: string | string[]): number => {
  const idString = Array.isArray(param) ? param[0] : param;
  return parseInt(idString);
};

export const eventController = {
    getAll: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const sortBy = req.query.sortBy as string || 'startDate';
      const sortOrder = req.query.sortOrder as string || 'asc';

      const result = await eventService.findAll({
        page,
        limit,
        search,
        status,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  getUpcoming: async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const events = await eventService.findUpcoming(limit);

      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },


getOne: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID invalide'
        });
      }

      const event = await eventService.findById(id);
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      const status = (error as any).statusCode || 500;
      res.status(status).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  getCurrentLive: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID invalide'
        });
      }

      const liveSession = await eventService.findCurrentLiveSession(id);
      
      if (!liveSession) {
        return res.json({
          success: true,
          data: null,
          message: 'Aucune session en cours actuellement'
        });
      }

      res.json({
        success: true,
        data: liveSession,
        isLive: true
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { title, description, startDate, endDate, location } = req.body;

       if (!title || title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Le titre doit contenir au moins 3 caractères'
        });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Les dates de début et de fin sont requises'
        });
      }

      const event = await eventService.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location
      });

      res.status(201).json({
        success: true,
        data: event,
        message: 'Événement créé avec succès'
      });
    } catch (error) {
      const status = (error as any).statusCode || 400;
      res.status(status).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID invalide'
        });
      }

      const { title, description, startDate, endDate, location } = req.body;

      const event = await eventService.update(id, {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location
      });

      res.json({
        success: true,
        data: event,
        message: 'Événement modifié avec succès'
      });
    } catch (error) {
      const status = (error as any).statusCode || 400;
      res.status(status).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = extractId(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID invalide'
        });
      }

      await eventService.delete(id);
      res.status(204).send();
    } catch (error) {
      const status = (error as any).statusCode || 400;
      res.status(status).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
};
