import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const questionService = {
    async GetQuestionsBySessionId(sessionId: number) {
        return await prisma.question.findMany({
            where: { sessionId: sessionId },
            orderBy: [
  { upvotes: "desc" },
  { createdAt: "asc" }
]
        });
    }
            };