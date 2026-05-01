import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const questionService = {
    async getQuestionsBySession(sessionId: number) {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new Error('SESSION_NOT_FOUND');
        }

        const now = new Date();

        const isLive = now >= session.startTime && now <= session.endTime;

        if(!isLive) {
            throw new Error('SESSION_NOT_LIVE');
        }

        return await prisma.question.findMany({
            where: { sessionId: sessionId },
            orderBy: {
                upvotes: 'desc',
            },
        }); 
            }
    }