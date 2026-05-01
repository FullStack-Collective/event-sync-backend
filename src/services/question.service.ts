import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const QuestionService = {
  async getQuestionsBySession(sessionId: number) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    console.log("CHECK LIVE:", {
      now: new Date().toISOString(),
      session: await prisma.session.findUnique({ where: { id: sessionId } }),
    });

    // 🔥 ULTRA SAFE TIME COMPARISON (PRODUCTION FIX)
    const now = Date.now();
    const start = Date.parse(session.startTime as any);
    const end = Date.parse(session.endTime as any);

    console.log("NOW   :", new Date(now).toISOString());
    console.log(" START :", new Date(start).toISOString());
    console.log(" END   :", new Date(end).toISOString());

    const isLive = now >= start && now <= end;

    if (!isLive) {
      throw new Error("SESSION_NOT_LIVE");
    }

    const questions = await prisma.question.findMany({
      where: { sessionId },
      orderBy: {
        upvotes: "desc",
      },
    });

    return questions;
  },
};
