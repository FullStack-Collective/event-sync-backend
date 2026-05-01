import express from "express";
import { QuestionController } from "../controllers/question.controller";

const router = express.Router();


router.get(
  "/sessions/:sessionId/questions",
  QuestionController.getQuestionsBySession
);

export default router;