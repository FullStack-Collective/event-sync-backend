import { Request, Response } from "express";
import { sessionService } from "../services/session.service";

export const sessionController = {
  getAll: async (req: Request, res: Response) => {
    const sessions = await sessionService.findAll();
    res.json({ data: sessions, total: sessions.length });
  },

  getOne: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const session = await sessionService.findById(id);
    res.json({ data: session });
  },

  getByEvent: async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId as string);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid Event ID' });
    }
    const sessions = await sessionService.findByEvent(eventId);
    res.json({ data: sessions, total: sessions.length });
  },

  create: async (req: Request, res: Response) => {
    try {
      const session = await sessionService.create(req.body);

      res.status(201).json({ data: session });
    } catch (error) {
      console.error("Error create session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const session = await sessionService.update(id, req.body);
    res.json({ data: session });
  },

  delete: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    await sessionService.delete(id);
    res.status(204).send();
  }
};