import { PrismaClient } from '@prisma/client';

export async function seedQuestions(prisma: PrismaClient) {
  console.log('Seeding questions...');
  
  // Get the live session
  const sessions = await prisma.session.findMany({
    include: { speakers: true },
  });
  
  const liveSession = sessions.find(s => {
    const now = new Date();
    return now >= s.startTime && now <= s.endTime;
  });
  
  if (!liveSession) {
    console.log('No live session found for questions');
    return [];
  }
  
  const questions = [
    {
      content: 'What are the main benefits of using Next.js App Router?',
      sessionId: liveSession.id,
      authorName: 'Alex Turner',
      upvotes: 15,
    },
    {
      content: 'How does React Server Components improve performance?',
      sessionId: liveSession.id,
      authorName: null,
      upvotes: 12,
    },
    {
      content: 'Can you recommend best practices for state management?',
      sessionId: liveSession.id,
      authorName: 'Maria Garcia',
      upvotes: 8,
    },
    {
      content: 'What about TypeScript integration with Next.js?',
      sessionId: liveSession.id,
      authorName: null, // Anonymous
      upvotes: 5,
    },
    {
      content: 'Are there any performance considerations with App Router?',
      sessionId: liveSession.id,
      authorName: 'James Wilson',
      upvotes: 3,
    },
  ];
  
  for (const question of questions) {
    await prisma.question.create({
      data: question,
    });
  }
  
  console.log(`Added ${questions.length} questions to live session`);
  return questions;
}