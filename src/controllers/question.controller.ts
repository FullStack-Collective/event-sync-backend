import { Request,Response } from "express";
import { questionService } from "../services/question.service";


export const QuesttionController = {
    async GetQuestionsBySession(req: Request, res: Response) {
        try {
            const sessionId = Number(req.params.sessionId);
            