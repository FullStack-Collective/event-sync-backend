import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const QuestionService = {
  async getQuestionsBySession(sessionId: number) {
    // 🔹 1. récupérer session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    // 🔹 2. gestion du temps (propre)
    const now = Date.now();
    const start = session.startTime.getTime();
    const end = session.endTime.getTime();

    // 🔹 3. debug (uniquement en dev)
    if (process.env.NODE_ENV !== "production") {
      console.log(" NOW   :", new Date(now).toISOString());
      console.log(" START :", new Date(start).toISOString());
      console.log(" END   :", new Date(end).toISOString());
    }

    // 🔹 4. logique live
    const isLive = now >= start && now <= end;

    if (!isLive) {
      throw new Error("SESSION_NOT_LIVE");
    }

    // 🔹 5. récupérer questions
    const questions = await prisma.question.findMany({
      where: { sessionId },
      orderBy: {
        upvotes: "desc",
      },
    });

    return questions;
  },
};