import { PrismaClient } from '@prisma/client';
import { seedRooms } from './seeds/rooms.seed';
import { seedEvents } from './seeds/events.seed';
import { seedSpeakers } from './seeds/speakers.seed';
import { seedSessions } from './seeds/sessions.seed';
import { seedQuestions } from './seeds/questions.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...\n');
  
  try {
    // Order matters because of foreign key constraints
    // 1. First, seed independent tables
    await seedRooms(prisma);
    await seedSpeakers(prisma);
    
    // 2. Then seed events (depends on nothing)
    await seedEvents(prisma);
    
    // 3. Then seed sessions (depends on events and rooms)
    await seedSessions(prisma);
    
    // 4. Finally seed questions (depends on sessions)
    await seedQuestions(prisma);
    
    console.log('\n✅ Database seeding completed successfully!');
    
    // Display summary
    const stats = {
      rooms: await prisma.room.count(),
      events: await prisma.event.count(),
      speakers: await prisma.speaker.count(),
      sessions: await prisma.session.count(),
      questions: await prisma.question.count(),
    };
    
    console.log('\n📊 Database Statistics:');
    console.log(`   - Rooms: ${stats.rooms}`);
    console.log(`   - Events: ${stats.events}`);
    console.log(`   - Speakers: ${stats.speakers}`);
    console.log(`   - Sessions: ${stats.sessions}`);
    console.log(`   - Questions: ${stats.questions}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });