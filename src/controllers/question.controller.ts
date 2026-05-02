import { Request, Response } from "express";
import { QuestionService } from "../services/question.service";

export const QuestionController = {
  async getQuestionsBySession(req: Request, res: Response) {
    try {
      const sessionId = Number(req.params.sessionId);

      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid sessionId" });
      }
      console.log("sessionId received:", sessionId);

      const questions = await QuestionService.getQuestionsBySession(sessionId);

      return res.status(200).json(questions);
    } catch (error: any) {
      console.log("ERROR QUESTION CONTROLLER:", error);

      if (error.message === "SESSION_NOT_FOUND") {
        return res.status(404).json({ message: "Session not found" });
      }

      if (error.message === "SESSION_NOT_LIVE") {
        return res.status(403).json({
          message: "Questions are only available during live session",

          debug: {
            hint: "Check session.startTime and session.endTime",
            sessionId: req.params.sessionId,
          },
        });
      }

      return res.status(500).json({
        message: "Internal server error",
        error: error.message, 
      });
    }
  },
};
