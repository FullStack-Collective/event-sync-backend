import express from "express";
import { QuestionController } from "../controllers/question.controller";

const router = express.Router();


router.get(
  "/sessions/:sessionId/questions",
  QuestionController.getQuestionsBySession

);

router.put(
  "/:id/upvote",
  QuestionController.upvoteQuestion
);

export default router;