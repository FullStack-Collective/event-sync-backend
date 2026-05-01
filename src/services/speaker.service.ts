import { PrismaClient, Speaker } from '@prisma/client';

const prisma = new PrismaClient();

export class SpeakerService {
    // Récupère la liste de tous les intervenants en base de données
    static async getAll(): Promise<Speaker[]> {
        return await prisma.speaker.findMany();
    }

}