import { PrismaClient } from '@prisma/client';

export async function seedSessions(prisma: PrismaClient) {
  console.log('🌱 Seeding sessions...');
  
  // First, get existing events and rooms
  const events = await prisma.event.findMany();
  const rooms = await prisma.room.findMany();
  const speakers = await prisma.speaker.findMany();
  
  if (events.length === 0 || rooms.length === 0) {
    console.log('⚠️ Please run events and rooms seeds first');
    return [];
  }
  
  // Create a map for quick lookup
  const roomMap = new Map(rooms.map(r => [r.name, r.id]));
  const speakerMap = new Map(speakers.map(s => [s.name, s.id]));
  
  const now = new Date();
  const today = new Date(now);
  today.setHours(10, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Session data with room names (will convert to IDs)
  const sessionsToCreate = [
    {
      title: 'Opening Keynote: Future of Web Development',
      description: 'Join us for the opening keynote exploring the future of web technologies',
      startTime: new Date(today.setHours(9, 0, 0, 0)),
      endTime: new Date(today.setHours(10, 30, 0, 0)),
      eventId: events[0]!.id,
      roomName: 'Grand Amphitheater',
      speakerNames: ['Dr. Sarah Johnson', 'Michael Chen'],
    },
    {
      title: 'Next.js App Router Deep Dive',
      description: 'Learn how to build modern applications with Next.js App Router',
      startTime: new Date(today.setHours(11, 0, 0, 0)),
      endTime: new Date(today.setHours(12, 30, 0, 0)),
      eventId: events[0]!.id,
      roomName: 'Conference Room A',
      speakerNames: ['Michael Chen'],
    },
    {
      title: 'React Server Components Workshop',
      description: 'Hands-on workshop with React Server Components',
      startTime: new Date(today.setHours(14, 0, 0, 0)),
      endTime: new Date(today.setHours(17, 0, 0, 0)),
      eventId: events[0]!.id,
      roomName: 'Workshop Studio',
      speakerNames: ['Dr. Sarah Johnson', 'Emma Rodriguez'],
    },
    {
      title: 'Building Scalable APIs with Node.js',
      description: 'Learn best practices for building production-ready APIs',
      startTime: new Date(tomorrow.setHours(10, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(11, 30, 0, 0)),
      eventId: events[0]!.id,
      roomName: 'Conference Room B',
      speakerNames: ['David Kim'],
    },
    {
      title: 'TypeScript Mastery',
      description: 'Advanced TypeScript patterns and techniques',
      startTime: new Date(tomorrow.setHours(13, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(15, 0, 0, 0)),
      eventId: events[0]!.id,
      roomName: 'Conference Room A',
      speakerNames: ['Emma Rodriguez', 'David Kim'],
    },
    {
      title: 'Live Q&A Session',
      description: 'Interactive session with speakers - ask your questions!',
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 1 * 60 * 60 * 1000),
      eventId: events[0]!.id,
      roomName: 'Grand Amphitheater',
      speakerNames: ['Dr. Sarah Johnson', 'Michael Chen', 'Emma Rodriguez'],
    },
  ];
  
  const createdSessions = [];
  
  for (const sessionData of sessionsToCreate) {
    // Get room ID from map
    const roomId = roomMap.get(sessionData.roomName);
    
    if (!roomId) {
      console.log(`⚠️ Room "${sessionData.roomName}" not found, skipping session...`);
      continue;
    }
    
    // Check if session already exists
    const existingSession = await prisma.session.findFirst({
      where: {
        title: sessionData.title,
        startTime: sessionData.startTime,
      },
    });
    
    if (existingSession) {
      console.log(`⚠️ Session "${sessionData.title}" already exists`);
      createdSessions.push(existingSession);
      continue;
    }
    
    // Create session
    const session = await prisma.session.create({
      data: {
        title: sessionData.title,
        description: sessionData.description,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        eventId: sessionData.eventId,
        roomId: roomId,
      },
    });
    
    createdSessions.push(session);
    console.log(`✅ Created session: "${sessionData.title}"`);
    
    // Associate speakers
    for (const speakerName of sessionData.speakerNames) {
      const speakerId = speakerMap.get(speakerName);
      
      if (speakerId) {
        await prisma.sessionSpeaker.upsert({
          where: {
            sessionId_speakerId: {
              sessionId: session.id,
              speakerId: speakerId,
            },
          },
          update: {},
          create: {
            sessionId: session.id,
            speakerId: speakerId,
          },
        });
        console.log(`   👤 Linked speaker: ${speakerName}`);
      } else {
        console.log(`   ⚠️ Speaker "${speakerName}" not found`);
      }
    }
  }
  
  console.log(`\n✅ Total sessions created: ${createdSessions.length}`);
  return createdSessions;
}