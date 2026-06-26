import { PrismaClient } from '@prisma/client';

export async function seedSpeakers(prisma: PrismaClient) {
  console.log('🌱 Seeding speakers...');
  
  const speakersToCreate = [
    {
      name: 'Dr. Sarah Johnson',
      bio: 'Leading expert in Web Technologies and AI integration. Author of "Modern Web Architecture"',
      photoUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      twitter: '@sarahjohnson',
      linkedin: 'linkedin.com/in/sarahjohnson',
      website: 'sarahjohnson.dev',
    },
    {
      name: 'Michael Chen',
      bio: 'Senior Developer Advocate at Vercel, specializing in Next.js and React ecosystems',
      photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      twitter: '@michaelchen',
      linkedin: 'linkedin.com/in/michaelchen',
      website: 'michaelchen.dev',
    },
    {
      name: 'Emma Rodriguez',
      bio: 'Full-stack developer and open-source contributor. Passionate about developer experience',
      photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      twitter: '@emmarodriguez',
      linkedin: 'linkedin.com/in/emmarodriguez',
      website: 'emmarodriguez.dev',
    },
    {
      name: 'David Kim',
      bio: 'CTO at TechStart. Expert in scalable architectures and cloud computing',
      photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      twitter: '@davidkim',
      linkedin: 'linkedin.com/in/davidkim',
      website: 'davidkim.dev',
    },
  ];
  
  const createdSpeakers = [];
  
  for (const speakerData of speakersToCreate) {
    // Check if speaker already exists by name (since name is unique in schema)
    const existingSpeaker = await prisma.speaker.findFirst({
      where: { name: speakerData.name },
    });
    
    if (existingSpeaker) {
      console.log(`⚠️ Speaker "${speakerData.name}" already exists, skipping...`);
      createdSpeakers.push(existingSpeaker);
      continue;
    }
    
    // Create new speaker
    const speaker = await prisma.speaker.create({
      data: speakerData,
    });
    
    createdSpeakers.push(speaker);
    console.log(`✅ Created speaker: "${speaker.name}" (ID: ${speaker.id})`);
  }
  
  console.log(`\n✅ Total speakers created: ${createdSpeakers.length}`);
  return createdSpeakers;
}