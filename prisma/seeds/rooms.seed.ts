import { PrismaClient } from '@prisma/client';

export async function seedRooms(prisma: PrismaClient) {
  console.log('Seeding rooms...');
  
  const rooms = [
    {
      name: 'Grand Amphitheater',
      capacity: 500,
    },
    {
      name: 'Conference Room A',
      capacity: 100,
    },
    {
      name: 'Conference Room B',
      capacity: 100,
    },
    {
      name: 'Workshop Studio',
      capacity: 50,
    },
    {
      name: 'VIP Lounge',
      capacity: 30,
    },
  ];
  
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    });
  }
  
  console.log(`✅ Added ${rooms.length} rooms`);
  return rooms;
}