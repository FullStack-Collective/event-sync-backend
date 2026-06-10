import { PrismaClient } from '@prisma/client';

export async function seedEvents(prisma: PrismaClient) {
  console.log('🌱 Seeding events...');
  
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);
  const nextTwoMonths = new Date();
  nextTwoMonths.setMonth(now.getMonth() + 2);
  
  const eventsToCreate = [
    {
      title: 'DevConf 2024',
      description: 'Annual developer conference featuring the latest in web technologies',
      startDate: nextMonth,
      endDate: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      location: 'Convention Center, San Francisco',
      bannerUrl: 'https://picsum.photos/id/0/1200/400',
    },
    {
      title: 'Tech Summit 2024',
      description: 'A summit bringing together tech leaders and innovators',
      startDate: nextTwoMonths,
      endDate: new Date(nextTwoMonths.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day later
      location: 'Tech Hub, New York',
      bannerUrl: 'https://picsum.photos/id/1/1200/400',
    },
    {
      title: 'React Advanced Workshop',
      description: 'Deep dive into React 19, Server Components, and advanced patterns',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      location: 'Online (Virtual)',
      bannerUrl: 'https://picsum.photos/id/100/1200/400',
    },
  ];
  
  const createdEvents = [];
  
  for (const eventData of eventsToCreate) {
    // Check if event already exists by title and startDate combination
    const existingEvent = await prisma.event.findFirst({
      where: {
        title: eventData.title,
        startDate: eventData.startDate,
      },
    });
    
    if (existingEvent) {
      console.log(`⚠️ Event "${eventData.title}" already exists, skipping...`);
      createdEvents.push(existingEvent);
      continue;
    }
    
    // Create new event
    const event = await prisma.event.create({
      data: eventData,
    });
    
    createdEvents.push(event);
    console.log(`✅ Created event: "${event.title}" (ID: ${event.id})`);
  }
  
  console.log(`\n✅ Total events created: ${createdEvents.length}`);
  return createdEvents;
}