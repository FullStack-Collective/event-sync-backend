import { prisma } from '../utils/prisma';
import { dateUtils } from '../utils/date.utils';
import { NotFoundError, ValidationError } from '../utils/errors';
import type { CreateEventInput, UpdateEventInput, EventQueryParams } from '../schemas/event.schema';
import { Prisma } from '@prisma/client';

export const eventService = {
  findAll: async (params: EventQueryParams) => {
    const { page, limit, search, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    let where: Prisma.EventWhereInput = {};

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
      metadata: {
        isLive: dateUtils.isLive(event.startDate, event.endDate),
        isUpcoming: dateUtils.isUpcoming(event.startDate),
        isPast: dateUtils.isPast(event.endDate),
        totalSessions: event.sessions.length,
        totalQuestions: event.sessions.reduce((acc, session) => acc + session._count.questions, 0)
      }
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
              orderBy: {
                upvotes: 'desc'
              },
              take: 50
		    }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundError('Événement');
    }

    const enrichedSessions = event.sessions.map(session => ({
      ...session,
      isLive: dateUtils.isLive(session.startTime, session.endTime),
      questionsCount: session.questions.length,
      totalUpvotes: session.questions.reduce((acc, q) => acc + q.upvotes, 0)
    }));

    return {
      ...event,
      sessions: enrichedSessions,
      metadata: {
        isLive: dateUtils.isLive(event.startDate, event.endDate),
        isUpcoming: dateUtils.isUpcoming(event.startDate),
        isPast: dateUtils.isPast(event.endDate),
        totalDuration: event.sessions.reduce((acc, session) => 
          acc + dateUtils.getDurationInMinutes(session.startTime, session.endTime), 0
        )
      }
    };
  },
 
  create: async (data: CreateEventInput) => {
    if (!dateUtils.isEndDateAfterStart(data.startDate, data.endDate)) {
      throw new ValidationError('La date de fin doit être après la date de début');
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
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location
      }
    });
  },

  update: async (id: number, data: UpdateEventInput) => {
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      throw new NotFoundError('Événement');
    }

    const startDate = data.startDate ? new Date(data.startDate) : existingEvent.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : existingEvent.endDate;

    if (!dateUtils.isEndDateAfterStart(startDate, endDate)) {
      throw new ValidationError('La date de fin doit être après la date de début');
    }

    return await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location
      }
    });
  },

  delete: async (id: number) => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundError('Événement');
    }

    return await prisma.event.delete({
      where: { id }
    });
  },

  findUpcoming: async (limit = 5) => {
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

   
  getStats: async (id: number) => {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            questions: true,
            speakers: true,
            room: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundError('Événement');
    }

    const totalSessions = event.sessions.length;
    const totalQuestions = event.sessions.reduce((acc, s) => acc + s.questions.length, 0);
    const totalUpvotes = event.sessions.reduce((acc, s) => 
      acc + s.questions.reduce((sum, q) => sum + q.upvotes, 0), 0
    );
    const uniqueSpeakers = new Set(event.sessions.flatMap(s => s.speakers.map(sp => sp.speakerId))).size;
    const uniqueRooms = new Set(event.sessions.map(s => s.roomId)).size;

    return {
      eventId: id,
      title: event.title,
      totalSessions,
      totalQuestions,
      totalUpvotes,
      uniqueSpeakers,
      uniqueRooms,
      averageQuestionsPerSession: totalSessions > 0 ? totalQuestions / totalSessions : 0,
      averageUpvotesPerQuestion: totalQuestions > 0 ? totalUpvotes / totalQuestions : 0
    };
  }
};