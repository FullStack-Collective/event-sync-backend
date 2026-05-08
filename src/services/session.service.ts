import { prisma } from '../utils/prisma';
import { Session } from '@prisma/client';

export const sessionService = {
  findAll: async () => {
    const sessions = await prisma.session.findMany({
      include: {
        event: true,
        room: true,
        speakers: true,
        questions: {
          orderBy: { upvotes: 'desc' }
        }
      },
      orderBy: { startTime: 'asc' }
    });
    
    const now = new Date();
    return sessions.map((session: Session) => ({
      ...session,
      isLive: now >= session.startTime && now <= session.endTime
    }));
  },
  
  findById: async (id: number) => {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        event: true,
        room: true,
        speakers: true,
        questions: {
          orderBy: { upvotes: 'desc' }
        }
      }
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const now = new Date();
    const isLive = now >= session.startTime && now <= session.endTime;
    
    return { ...session, isLive };
  },
  
  findByEvent: async (eventId: number) => {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    const sessions = await prisma.session.findMany({
      where: { eventId },
      include: {
        room: true,
        speakers: true
      },
      orderBy: { startTime: 'asc' }
    });
    
    const now = new Date();
    return sessions.map((session: Session) => ({
      ...session,
      isLive: now >= session.startTime && now <= session.endTime
    }));
  },
  
  create: async (data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    eventId: number;
    roomId: number;
  }) => {
    const event = await prisma.event.findUnique({
      where: { id: data.eventId }
    });
    if (!event) {
      throw new Error('Event not found');
    }
    
    const room = await prisma.room.findUnique({
      where: { id: data.roomId }
    });
    if (!room) {
      throw new Error('Room not found');
    }
    
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    if (end <= start) {
      throw new Error('The end time must be after the start time');
    }
    
    const overlappingSession = await prisma.session.findFirst({
      where: {
        roomId: data.roomId,
        OR: [
          { AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }]},
          { AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }]},
          { AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }]}
        ]
      }
    });
    
    if (overlappingSession) {
      throw new Error('This room is already booked during that time slot');
    }
    
    return await prisma.session.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: start,
        endTime: end,
        eventId: data.eventId,
        roomId: data.roomId
      },
      include: {
        event: true,
        room: true,
        speakers: true
      }
    });
  },
  
  update: async (id: number, data: Partial<{
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    roomId: number;
  }>) => {
    const existingSession = await prisma.session.findUnique({
      where: { id }
    });
    
    if (!existingSession) {
      throw new Error('Session not found');
    }
    
    if (data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId }
      });
      if (!room) {
        throw new Error('Room not found');
      }
    }
    
    let startTime = data.startTime ? new Date(data.startTime) : existingSession.startTime;
    let endTime = data.endTime ? new Date(data.endTime) : existingSession.endTime;
    let roomId = data.roomId || existingSession.roomId;
    
    if (endTime <= startTime) {
      throw new Error('The end time must be after the start time');
    }
    
    const overlappingSession = await prisma.session.findFirst({
      where: {
        id: { not: id },
        roomId: roomId,
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
        ]
      }
    });
    
    if (overlappingSession) {
      throw new Error('This room is already booked during that time slot');
    }
    
    return await prisma.session.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startTime: startTime,
        endTime: endTime,
        roomId: roomId
      },
      include: {
        event: true,
        room: true,
        speakers: true
      }
    });
  },
  
  delete: async (id: number) => {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        questions: true
      }
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    return await prisma.session.delete({ where: { id } });
  }
};