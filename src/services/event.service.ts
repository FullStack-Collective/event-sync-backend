import { prisma } from '../utils/prisma';

// Fonctions utilitaires simples sans dayjs
const isEndDateAfterStart = (startDate: Date, endDate: Date): boolean => {
  return endDate > startDate;
};

const isLive = (startDate: Date, endDate: Date): boolean => {
  const now = new Date();
  return now >= startDate && now <= endDate;
};

const isUpcoming = (startDate: Date): boolean => {
  return startDate > new Date();
};

const isPast = (endDate: Date): boolean => {
  return endDate < new Date();
};

const getDurationInMinutes = (startDate: Date, endDate: Date): number => {
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60);
};

export const eventService = {
  findAll: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy: string;
    sortOrder: string;
  }) => {
    const { page, limit, search, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    const now = new Date();
    if (status === 'upcoming') {
      where.startDate = { gt: now };
    } else if (status === 'past') {
      where.endDate = { lt: now };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          sessions: {
            include: {
              room: true,
              speakers: true,
              _count: {
                select: { questions: true }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.event.count({ where })
    ]);

    const enrichedEvents = events.map(event => ({
      ...event,
      isLive: isLive(event.startDate, event.endDate),
      isUpcoming: isUpcoming(event.startDate),
      isPast: isPast(event.endDate),
      totalSessions: event.sessions.length,
      totalQuestions: event.sessions.reduce((acc, session) => acc + session._count.questions, 0)
    }));

    return {
      data: enrichedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  },

  findById: async (id: number) => {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            room: true,
            speakers: {
              include: {
                speaker: true
              }
            },
            questions: {
              orderBy: { upvotes: 'desc' },
              take: 50
            }
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });

    if (!event) {
      throw new Error('Événement non trouvé');
    }

    const enrichedSessions = event.sessions.map(session => ({
      ...session,
      isLive: isLive(session.startTime, session.endTime),
      questionsCount: session.questions.length,
      totalUpvotes: session.questions.reduce((acc, q) => acc + q.upvotes, 0)
    }));

    return {
      ...event,
      sessions: enrichedSessions,
      isLive: isLive(event.startDate, event.endDate),
      isUpcoming: isUpcoming(event.startDate),
      isPast: isPast(event.endDate),
      totalDuration: event.sessions.reduce((acc, session) => 
        acc + getDurationInMinutes(session.startTime, session.endTime), 0
      )
    };
  },

  create: async (data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
  }) => {
    if (!isEndDateAfterStart(data.startDate, data.endDate)) {
      throw new Error('La date de fin doit être après la date de début');
    }

    const conflictingEvents = await prisma.event.findFirst({
      where: {
        OR: [
          {
            AND: [
              { startDate: { lte: data.startDate } },
              { endDate: { gte: data.startDate } }
            ]
          },
          {
            AND: [
              { startDate: { lte: data.endDate } },
              { endDate: { gte: data.endDate } }
            ]
          }
        ]
      }
    });

    if (conflictingEvents) {
      console.warn(`Conflit potentiel avec l'événement "${conflictingEvents.title}"`);
    }

    return await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location
      }
    });
  },

  update: async (id: number, data: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
  }) => {
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      throw new Error('Événement non trouvé');
    }

    const startDate = data.startDate || existingEvent.startDate;
    const endDate = data.endDate || existingEvent.endDate;

    if (!isEndDateAfterStart(startDate, endDate)) {
      throw new Error('La date de fin doit être après la date de début');
    }

    return await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location
      }
    });
  },

  delete: async (id: number) => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    return await prisma.event.delete({ where: { id } });
  },

  findUpcoming: async (limit: number = 5) => {
    return await prisma.event.findMany({
      where: {
        startDate: { gt: new Date() }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: limit,
      include: {
        sessions: {
          take: 3,
          orderBy: { startTime: 'asc' }
        }
      }
    });
  },

  findCurrentLiveSession: async (eventId: number) => {
    const now = new Date();
    
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        sessions: {
          where: {
            startTime: { lte: now },
            endTime: { gte: now }
          },
          include: {
            room: true,
            speakers: true,
            questions: {
              orderBy: { upvotes: 'desc' },
              take: 10
            }
          },
          take: 1
        }
      }
    });

    if (!event || event.sessions.length === 0) {
      return null;
    }

    return event.sessions[0];
  },
};