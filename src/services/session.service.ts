import { prisma } from '../utils/prisma';

export const sessionService = {
  /**
   * Récupérer toutes les sessions avec toutes leurs relations
   * Public - accessible à tous
   */
  findAll: async () => {
    const sessions = await prisma.session.findMany({
      include: {
        event: true,      // Événement parent
        room: true,       // Salle où ça se passe
        speakers: true,   // Intervenants
        questions: {      // Questions posées
          orderBy: { upvotes: 'desc' }  // Tri par popularité
        }
      },
      orderBy: { startTime: 'asc' }  // Tri chronologique
    });
    
    // Ajouter un champ isLive calculé dynamiquement
    const now = new Date();
    return sessions.map(session => ({
      ...session,
      isLive: now >= session.startTime && now <= session.endTime
    }));
  },
  
  /**
   * Récupérer une session spécifique par son ID
   * Public - accessible à tous
   */
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
      throw new Error('Session non trouvée');
    }
    
    // Calculer si la session est en cours
    const now = new Date();
    const isLive = now >= session.startTime && now <= session.endTime;
    
    return { ...session, isLive };
  },
  
  /**
   * Récupérer toutes les sessions d'un événement spécifique
   * Public - accessible à tous
   */
  findByEvent: async (eventId: number) => {
    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    const sessions = await prisma.session.findMany({
      where: { eventId },
      include: {
        room: true,
        speakers: true
      },
      orderBy: { startTime: 'asc' }
    });
    
    // Ajouter le champ isLive
    const now = new Date();
    return sessions.map(session => ({
      ...session,
      isLive: now >= session.startTime && now <= session.endTime
    }));
  },
  
  /**
   * Créer une nouvelle session
   * Admin uniquement
   */
  create: async (data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    eventId: number;
    roomId: number;
  }) => {
    // 1. Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: data.eventId }
    });
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    // 2. Vérifier que la salle existe
    const room = await prisma.room.findUnique({
      where: { id: data.roomId }
    });
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    // 3. Vérifier que les horaires sont cohérents
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    if (end <= start) {
      throw new Error('L\'heure de fin doit être après l\'heure de début');
    }
    
    // 4. Vérifier que la session ne chevauche pas une autre dans la même salle
    const overlappingSession = await prisma.session.findFirst({
      where: {
        roomId: data.roomId,
        OR: [
          {
            // Nouvelle session commence pendant une session existante
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            // Nouvelle session se termine pendant une session existante
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            // Nouvelle session englobe une session existante
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      }
    });
    
    if (overlappingSession) {
      throw new Error('Cette salle est déjà occupée sur ce créneau horaire');
    }
    
    // 5. Créer la session
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
  
  /**
   * Modifier une session existante
   * Admin uniquement
   */
  update: async (id: number, data: Partial<{
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    roomId: number;
  }>) => {
    // 1. Vérifier que la session existe
    const existingSession = await prisma.session.findUnique({
      where: { id }
    });
    
    if (!existingSession) {
      throw new Error('Session non trouvée');
    }
    
    // 2. Si on change la salle, vérifier qu'elle existe
    if (data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId }
      });
      if (!room) {
        throw new Error('Salle non trouvée');
      }
    }
    
    // 3. Si on change les horaires, vérifier la cohérence
    let startTime = data.startTime ? new Date(data.startTime) : existingSession.startTime;
    let endTime = data.endTime ? new Date(data.endTime) : existingSession.endTime;
    let roomId = data.roomId || existingSession.roomId;
    
    if (endTime <= startTime) {
      throw new Error('L\'heure de fin doit être après l\'heure de début');
    }
    
    // 4. Vérifier les chevauchements (sauf avec la session elle-même)
    const overlappingSession = await prisma.session.findFirst({
      where: {
        id: { not: id },  // Exclure la session actuelle
        roomId: roomId,
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
        ]
      }
    });
    
    if (overlappingSession) {
      throw new Error('Cette salle est déjà occupée sur ce créneau horaire');
    }
    
    // 5. Mettre à jour la session
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
  
  /**
   * Supprimer une session
   * Admin uniquement
   */
  delete: async (id: number) => {
    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        questions: true  // Pour voir combien de questions vont être supprimées
      }
    });
    
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    // Supprimer la session (les questions seront supprimées en cascade)
    return await prisma.session.delete({ where: { id } });
  }
};