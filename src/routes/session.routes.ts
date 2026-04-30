import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Routes publiques (lecture seule)
// ============================================
router.get('/', sessionController.getAll);                    // Liste toutes les sessions
router.get('/:id', sessionController.getOne);                 // Détail d'une session
router.get('/event/:eventId', sessionController.getByEvent);  // Sessions par événement

// Note: L'ordre des routes est important !
// "/event/:eventId" doit être avant "/:id" pour ne pas être interprété comme un ID

// ============================================
// Routes protégées (admin uniquement)
// ============================================
router.post('/', authMiddleware, sessionController.create);     // Créer une session
router.put('/:id', authMiddleware, sessionController.update);   // Modifier une session
router.delete('/:id', authMiddleware, sessionController.delete); // Supprimer une session

export default router;