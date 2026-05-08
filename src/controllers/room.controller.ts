import { Request, Response } from 'express';
import { roomService } from '../services/room.service';

export const roomController = {
  getAll: async (req: Request, res: Response) => {
    const rooms = await roomService.findAll();
    res.json({
      data: rooms,
      total: rooms.length
    });
  },
  
  getOne: async (req: Request, res: Response) => {
    const id = req.params.id;
    
    if (typeof id !== 'string') {
      throw new Error('Invalid ID');
    }

    const room = await roomService.findById(parseInt(id));
    res.json({ data: room });
  },
  
  create: async (req: Request, res: Response) => {
    const room = await roomService.create(req.body);
    res.status(201).json({ data: room });
  },
  
  update: async (req: Request, res: Response) => {

    const id = req.params.id;
    
    if (typeof id !== 'string') {
      throw new Error('Invalid ID');
    }

    const room = await roomService.update(parseInt(id), req.body);
    res.json({ data: room });
  },
  
  delete: async (req: Request, res: Response) => {
    const id = req.params.id;
    
    if (typeof id !== 'string') {
      throw new Error('Invalid ID');
    }
    await roomService.delete(parseInt(id));
    res.status(204).send();
  }
};