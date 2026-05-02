import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';

export const sessionController = {
  getAll: async (req: Request, res: Response) => {
    const sessions = await sessionService.findAll();
    res.json({
      data: sessions,
      total: sessions.length
    });
  },
  
  getOne: async (req: Request, res: Response) => {
    const id = req.params.id;
    if (id !== 'string') {
        throw new Error('Invalid ID');
    }
    const session = await sessionService.findById(parseInt(id));
    res.json({ data: session });
  },
  
  getByEvent: async (req: Request, res: Response) => {
    const eventId = req.params.eventId;
    if (eventId !== 'string') {
        throw new Error('Invalid Event ID');
    }
    const sessions = await sessionService.findByEvent(parseInt(eventId));
    res.json({
      data: sessions,
      total: sessions.length
    });
  },
  
  create: async (req: Request, res: Response) => {
    const session = await sessionService.create(req.body);
    res.status(201).json({ data: session });
  },
  
  update: async (req: Request, res: Response) => {
    const id = req.params.id;
    if (id !== 'string') {
        throw new Error('Invalid ID');
    }
    const session = await sessionService.update(parseInt(id), req.body);
    res.json({ data: session });
  },
  
  delete: async (req: Request, res: Response) => {
    const id = req.params.id;
    if (id !== 'string') {
        throw new Error('Invalid ID');
    }
    await sessionService.delete(parseInt(id));
    res.status(204).send();
  }
};