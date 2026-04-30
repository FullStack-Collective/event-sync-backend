import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Routes publiques (lecture seule)
// ============================================
router.get('/', roomController.getAll);      // Liste toutes les salles
router.get('/:id', roomController.getOne);   // Détail d'une salle

// ============================================
// Routes protégées (admin uniquement)
// ============================================
router.post('/', authMiddleware, roomController.create);     // Créer une salle
router.put('/:id', authMiddleware, roomController.update);   // Modifier une salle
router.delete('/:id', authMiddleware, roomController.delete); // Supprimer une salle

export default router;