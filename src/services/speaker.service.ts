import { PrismaClient, Speaker } from '@prisma/client';

const prisma = new PrismaClient();

export class SpeakerService {
    static async getAll(): Promise<Speaker[]> {
        return await prisma.speaker.findMany();
    }

    static async getById(id: number): Promise<Speaker | null> {
        return await prisma.speaker.findUnique({
            where: { id },
            include: {
                sessions: {
                    include: {
                        session: true, // Inclut les détails de la session liée
                    },
                },
            },
        });
    }
}