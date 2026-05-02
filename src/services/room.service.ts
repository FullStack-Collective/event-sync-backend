import { prisma } from '../utils/prisma';

export const roomService = {
  findAll: async () => {
    return await prisma.room.findMany({
      include: {
        sessions: {
          include: {
            event: true,
            speakers: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  },
  
  findById: async (id: number) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            event: true,
            speakers: true
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    
    if (!room) {
      throw new Error('Room not found');
    }
    
    return room;
  },
  
  create: async (data: { name: string; capacity?: number }) => {
    const existingRoom = await prisma.room.findUnique({
      where: { name: data.name }
    });
    
    if (existingRoom) {
      throw new Error('A room with that name already exists');
    }
    
    return await prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity
      }
    });
  },
  
  update: async (id: number, data: Partial<{ name: string; capacity: number }>) => {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new Error('Room not found');
    }
    
    if (data.name && data.name !== room.name) {
      const existingRoom = await prisma.room.findUnique({
        where: { name: data.name }
      });
      if (existingRoom) {
        throw new Error('A room with that name already exists');
      }
    }
    
    return await prisma.room.update({
      where: { id },
      data
    });
  },
  
  delete: async (id: number) => {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new Error('Room not found');
    }
    
    return await prisma.room.delete({ where: { id } });
  }
};