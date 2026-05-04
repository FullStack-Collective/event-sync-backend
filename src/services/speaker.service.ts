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
                        session: true,
                    },
                },
            },
        });
    }

    static async create(data: {
        name: string;
        photoUrl?: string;
        bio?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
        facebook?: string;
    }): Promise<Speaker> {
        return await prisma.speaker.create({
            data: {
                name: data.name,
                photoUrl: data.photoUrl,
                bio: data.bio,
                twitter: data.twitter,
                linkedin: data.linkedin,
                website: data.website,
                facebook: data.facebook,
            },
        });
    }

    static async update(
        id: number,
        data: {
            name?: string;
            photoUrl?: string;
            bio?: string;
            twitter?: string;
            linkedin?: string;
            website?: string;
            facebook?: string;
        }
    ): Promise<Speaker | null> {
        return await prisma.speaker.update({
            where: { id },
            data: {
                name: data.name,
                photoUrl: data.photoUrl,
                bio: data.bio,
                twitter: data.twitter,
                linkedin: data.linkedin,
                website: data.website,
                facebook: data.facebook,
            },
        });
    }

    static async delete(id: number): Promise<Speaker> {
        return await prisma.speaker.delete({
            where: { id },
        });
    }

    static async getSessionsBySpeakerId(speakerId: number) {
        return await prisma.sessionSpeaker.findMany({
            where: { speakerId },
            include: {
                session: true,
            },
        });
    }
    static async removeSession(speakerId: number, sessionId: number) {
        return await prisma.sessionSpeaker.delete({
            where: {
                sessionId_speakerId: {
                    speakerId,
                    sessionId,
                },
            },
        });
    }
}