import { Request, Response } from "express";
import { sessionService } from "../services/session.service";

export const sessionController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const sessions = await sessionService.findAll();

      res.json({
        data: sessions,
        total: sessions.length,
      });
    } catch (error) {
      console.error("Error getAll sessions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getOne: async (req: Request, res: Response) => {
    try {
      // 🔥  conversion + validation correcte
      const id = Number(req.params.id);

      // 🔥 CHANGEMENT)
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const session = await sessionService.findById(id);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json({ data: session });
    } catch (error) {
      console.error("Error getOne session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getByEvent: async (req: Request, res: Response) => {
    try {
      //  FIX PRINCIPAL ICI
      const eventId = Number(req.params.eventId);

      //  CHANGEMENT CRITIQUE:
      // AVANT  if (eventId !== 'string')
      // MAINTENANT vraie validation
      if (Number.isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid Event ID" });
      }

      const sessions = await sessionService.findByEvent(eventId);

      res.json({
        data: sessions,
        total: sessions.length,
      });
    } catch (error) {
      console.error("Error getByEvent:", error);
      res.status(500).json({ message: "Internal server error" });
    }
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
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const updated = await sessionService.update(id, req.body);

      res.json({ data: updated });
    } catch (error) {
      console.error("Error update session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await sessionService.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error("Error delete session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
