import { prisma } from '../utils/prisma';

export const roomService = {
  /**
   * Récupérer toutes les salles avec leurs sessions
   * Public - accessible à tous
   */
  findAll: async () => {
    return await prisma.room.findMany({
      include: {
        sessions: {
          include: {
            event: true,      // Inclut l'événement parent
            speakers: true    // Inclut les intervenants
          }
        }
      },
      orderBy: { name: 'asc' }  // Tri alphabétique
    });
  },
  
  /**
   * Récupérer une salle spécifique par son ID
   * Public - accessible à tous
   */
  findById: async (id: number) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            event: true,
            speakers: true
          },
          orderBy: { startTime: 'asc' }  // Tri chronologique
        }
      }
    });
    
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    return room;
  },
  
  /**
   * Créer une nouvelle salle
   * Admin uniquement
   */
  create: async (data: { name: string; capacity?: number }) => {
    // Vérifier si une salle avec le même nom existe déjà
    const existingRoom = await prisma.room.findUnique({
      where: { name: data.name }
    });
    
    if (existingRoom) {
      throw new Error('Une salle avec ce nom existe déjà');
    }
    
    // Créer la nouvelle salle
    return await prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity
      }
    });
  },
  
  /**
   * Modifier une salle existante
   * Admin uniquement
   */
  update: async (id: number, data: Partial<{ name: string; capacity: number }>) => {
    // Vérifier que la salle existe
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    // Si on change le nom, vérifier qu'il n'est pas déjà pris
    if (data.name && data.name !== room.name) {
      const existingRoom = await prisma.room.findUnique({
        where: { name: data.name }
      });
      if (existingRoom) {
        throw new Error('Une salle avec ce nom existe déjà');
      }
    }
    
    // Mettre à jour la salle
    return await prisma.room.update({
      where: { id },
      data
    });
  },
  
  /**
   * Supprimer une salle
   * Admin uniquement
   * Note: Les sessions dans cette salle ne seront pas supprimées 
   * (leur roomId deviendra null si on a mis onDelete: SetNull)
   */
  delete: async (id: number) => {
    // Vérifier que la salle existe
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    // Supprimer la salle
    return await prisma.room.delete({ where: { id } });
  }
};