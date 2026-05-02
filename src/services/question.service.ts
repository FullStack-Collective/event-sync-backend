import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const QuestionService = {
  async getQuestionsBySession(sessionId: number) {
    //  1. récupérer session
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    //  2. gestion du temps (propre)
    const now = Date.now();
    const start = session.startTime.getTime();
    const end = session.endTime.getTime();

    //  3. debug (uniquement en dev)
    if (process.env.NODE_ENV !== "production") {
      console.log(" NOW   :", new Date(now).toISOString());
      console.log(" START :", new Date(start).toISOString());
      console.log(" END   :", new Date(end).toISOString());
    }

    //  4. logique live
    const isLive = now >= start && now <= end;

    if (!isLive) {
      throw new Error("SESSION_NOT_LIVE");
    }

    //  5. récupérer questions
    const questions = await prisma.question.findMany({
      where: { sessionId },
      orderBy: {
        upvotes: "desc",
      },
    });

    return questions;

    
  },

    // =================================================================


    async upvoteQuestion(questionId: number,userId:string) {
  // 🔹 vérifier si la question existe
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("QUESTION_NOT_FOUND");
  }


    return await prisma.question.update({
    where: { id: questionId },
    data: {
      upvotes: {
        increment: 1,
      },
    },
  });
 
},


// =================================================================


async createQuestion(data: {
  content: string;
  sessionId: number;
  authorName?: string;
}) {
  // 1. check session
  const session = await prisma.session.findUnique({
    where: { id: data.sessionId },
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  // 2. check LIVE
  const now = Date.now();
  const start = session.startTime.getTime();
  const end = session.endTime.getTime();

  const isLive = now >= start && now <= end;

  if (!isLive) {
    throw new Error("SESSION_NOT_LIVE");
  }

  // 3. create question
  return await prisma.question.create({
    data: {
      content: data.content,
      sessionId: data.sessionId,
      authorName: data.authorName || null,
    },
  });
},


// =================================================================

async deleteQuestion(questionId: number) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  await prisma.question.delete({
    where: { id: questionId },
  });

  return { success: true };
}







};