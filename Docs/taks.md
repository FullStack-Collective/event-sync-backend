## 📋 Répartition des Tâches par Développeur

| Développeur | Entités | Nombre d'endpoints | Difficulté | Temps estimé |
|-------------|---------|-------------------|------------|--------------|
| **Dev A** | Events | 5 | Facile | 2-3 heures |
| **Dev B** | Sessions + Rooms | 10 | Moyen | 4-5 heures |
| **Dev C** | Speakers + SessionSpeakers | 8 | Moyen | 3-4 heures |
| **Dev D** | Questions + Logique live | 4 | Moyen+ | 3-4 heures |

---

## 🎯 Dev A : Events (5 endpoints)

### Fichiers à créer
```
src/controllers/event.controller.ts
src/services/event.service.ts
src/routes/event.routes.ts
```

### Endpoints à implémenter

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/events` | Liste tous les événements | Public |
| GET | `/api/events/:id` | Détail d'un événement + sessions associées | Public |
| POST | `/api/events` | Créer un événement | Admin |
| PUT | `/api/events/:id` | Modifier un événement | Admin |
| DELETE | `/api/events/:id` | Supprimer un événement (cascade) | Admin |

### Code à implémenter

<details>
<summary>📄 event.service.ts (Cliquez pour voir)</summary>

```typescript
import { prisma } from '../utils/prisma';

export const eventService = {
  findAll: async () => {
    return await prisma.event.findMany({
      include: {
        sessions: {
          include: {
            room: true,
            speakers: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
  },
  
  findById: async (id: number) => {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            room: true,
            speakers: true
          }
        }
      }
    });
    
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    return event;
  },
  
  create: async (data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
  }) => {
    // Validation: date de fin après date de début
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error('La date de fin doit être après la date de début');
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
  
  update: async (id: number, data: Partial<{
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
  }>) => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    // Validation si les deux dates sont fournies
    if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
      throw new Error('La date de fin doit être après la date de début');
    }
    
    return await prisma.event.update({
      where: { id },
      data
    });
  },
  
  delete: async (id: number) => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    // Suppression en cascade (les sessions seront automatiquement supprimées)
    return await prisma.event.delete({
      where: { id }
    });
  }
};
```
</details>

<details>
<summary>📄 event.controller.ts (Cliquez pour voir)</summary>

```typescript
import { Request, Response } from 'express';
import { eventService } from '../services/event.service';

export const eventController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const events = await eventService.findAll();
      res.json({
        data: events,
        total: events.length,
        page: 1,
        pageSize: events.length
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  
  getOne: async (req: Request, res: Response) => {
    try {
      const event = await eventService.findById(parseInt(req.params.id));
      res.json({ data: event });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },
  
  create: async (req: Request, res: Response) => {
    try {
      const event = await eventService.create(req.body);
      res.status(201).json({ data: event });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
  
  update: async (req: Request, res: Response) => {
    try {
      const event = await eventService.update(parseInt(req.params.id), req.body);
      res.json({ data: event });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
  
  delete: async (req: Request, res: Response) => {
    try {
      await eventService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
};
```
</details>

<details>
<summary>📄 event.routes.ts (Cliquez pour voir)</summary>

```typescript
import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.get('/', eventController.getAll);
router.get('/:id', eventController.getOne);

// Routes admin uniquement
router.post('/', authMiddleware, eventController.create);
router.put('/:id', authMiddleware, eventController.update);
router.delete('/:id', authMiddleware, eventController.delete);

export default router;
```
</details>

---

## 🎯 Dev B : Sessions + Rooms (10 endpoints)

### Fichiers à créer
```
src/controllers/session.controller.ts
src/controllers/room.controller.ts
src/services/session.service.ts
src/services/room.service.ts
src/routes/session.routes.ts
src/routes/room.routes.ts
```

### Endpoints Session (6 endpoints)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/sessions` | Liste toutes les sessions | Public |
| GET | `/api/sessions/:id` | Détail d'une session + speakers + questions | Public |
| GET | `/api/events/:eventId/sessions` | Sessions d'un événement spécifique | Public |
| POST | `/api/sessions` | Créer une session | Admin |
| PUT | `/api/sessions/:id` | Modifier une session | Admin |
| DELETE | `/api/sessions/:id` | Supprimer une session | Admin |

### Endpoints Room (4 endpoints)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/rooms` | Liste toutes les salles | Public |
| GET | `/api/rooms/:id` | Détail d'une salle | Public |
| POST | `/api/rooms` | Créer une salle | Admin |
| PUT | `/api/rooms/:id` | Modifier une salle | Admin |
| DELETE | `/api/rooms/:id` | Supprimer une salle | Admin |

### Code à implémenter

<details>
<summary>📄 session.service.ts (Cliquez pour voir)</summary>

```typescript
import { prisma } from '../utils/prisma';

export const sessionService = {
  findAll: async () => {
    return await prisma.session.findMany({
      include: {
        event: true,
        room: true,
        speakers: true,
        questions: {
          orderBy: { upvotes: 'desc' }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  },
  
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
    
    // Calculer si la session est live
    const now = new Date();
    const isLive = now >= session.startTime && now <= session.endTime;
    
    return { ...session, isLive };
  },
  
  findByEvent: async (eventId: number) => {
    return await prisma.session.findMany({
      where: { eventId },
      include: {
        room: true,
        speakers: true
      },
      orderBy: { startTime: 'asc' }
    });
  },
  
  create: async (data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    eventId: number;
    roomId: number;
  }) => {
    // Validation: vérifier que l'event existe
    const event = await prisma.event.findUnique({
      where: { id: data.eventId }
    });
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    // Validation: vérifier que la room existe
    const room = await prisma.room.findUnique({
      where: { id: data.roomId }
    });
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    // Validation: horaires cohérents
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      throw new Error('L\'heure de fin doit être après l\'heure de début');
    }
    
    // Validation: ne chevauche pas une autre session dans la même salle
    const overlapping = await prisma.session.findFirst({
      where: {
        roomId: data.roomId,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(data.startTime) } },
              { endTime: { gt: new Date(data.startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(data.endTime) } },
              { endTime: { gte: new Date(data.endTime) } }
            ]
          }
        ]
      }
    });
    
    if (overlapping) {
      throw new Error('Cette salle est déjà occupée sur ce créneau');
    }
    
    return await prisma.session.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        eventId: data.eventId,
        roomId: data.roomId
      },
      include: {
        event: true,
        room: true
      }
    });
  },
  
  update: async (id: number, data: Partial<{
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    roomId: number;
  }>) => {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    return await prisma.session.update({
      where: { id },
      data,
      include: {
        event: true,
        room: true,
        speakers: true
      }
    });
  },
  
  delete: async (id: number) => {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    return await prisma.session.delete({ where: { id } });
  }
};
```
</details>

<details>
<summary>📄 room.service.ts (Cliquez pour voir)</summary>

```typescript
import { prisma } from '../utils/prisma';

export const roomService = {
  findAll: async () => {
    return await prisma.room.findMany({
      include: {
        sessions: {
          include: {
            event: true,
            speakers: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  },
  
  findById: async (id: number) => {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            event: true,
            speakers: true
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    return room;
  },
  
  create: async (data: { name: string; capacity?: number }) => {
    // Vérifier si le nom existe déjà
    const existing = await prisma.room.findUnique({
      where: { name: data.name }
    });
    
    if (existing) {
      throw new Error('Une salle avec ce nom existe déjà');
    }
    
    return await prisma.room.create({ data });
  },
  
  update: async (id: number, data: Partial<{ name: string; capacity: number }>) => {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    // Si on change le nom, vérifier qu'il n'existe pas
    if (data.name && data.name !== room.name) {
      const existing = await prisma.room.findUnique({
        where: { name: data.name }
      });
      if (existing) {
        throw new Error('Une salle avec ce nom existe déjà');
      }
    }
    
    return await prisma.session.update({
      where: { id },
      data
    });
  },
  
  delete: async (id: number) => {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new Error('Salle non trouvée');
    }
    
    return await prisma.room.delete({ where: { id } });
  }
};
```
</details>

---

## 🎯 Dev C : Speakers + SessionSpeakers (8 endpoints)

### Fichiers à créer
```
src/controllers/speaker.controller.ts
src/services/speaker.service.ts
src/routes/speaker.routes.ts
```

### Endpoints Speaker (7 endpoints)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/speakers` | Liste tous les speakers | Public |
| GET | `/api/speakers/:id` | Détail d'un speaker + ses sessions | Public |
| POST | `/api/speakers` | Créer un speaker | Admin |
| PUT | `/api/speakers/:id` | Modifier un speaker | Admin |
| DELETE | `/api/speakers/:id` | Supprimer un speaker | Admin |
| POST | `/api/sessions/:sessionId/speakers/:speakerId` | Ajouter un speaker à une session | Admin |
| DELETE | `/api/sessions/:sessionId/speakers/:speakerId` | Retirer un speaker d'une session | Admin |

### Code à implémenter

<details>
<summary>📄 speaker.service.ts (Cliquez pour voir)</summary>

```typescript
import { prisma } from '../utils/prisma';

export const speakerService = {
  findAll: async () => {
    return await prisma.speaker.findMany({
      include: {
        sessions: {
          include: {
            event: true,
            room: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  },
  
  findById: async (id: number) => {
    const speaker = await prisma.speaker.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            event: true,
            room: true
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });
    
    if (!speaker) {
      throw new Error('Intervenant non trouvé');
    }
    
    return speaker;
  },
  
  create: async (data: {
    name: string;
    photoUrl?: string;
    bio?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  }) => {
    return await prisma.speaker.create({ data });
  },
  
  update: async (id: number, data: Partial<{
    name: string;
    photoUrl: string;
    bio: string;
    twitter: string;
    linkedin: string;
    website: string;
  }>) => {
    const speaker = await prisma.speaker.findUnique({ where: { id } });
    if (!speaker) {
      throw new Error('Intervenant non trouvé');
    }
    
    return await prisma.speaker.update({
      where: { id },
      data
    });
  },
  
  delete: async (id: number) => {
    const speaker = await prisma.speaker.findUnique({ where: { id } });
    if (!speaker) {
      throw new Error('Intervenant non trouvé');
    }
    
    return await prisma.speaker.delete({ where: { id } });
  },
  
  // Gestion de la liaison Session-Speaker
  addToSession: async (sessionId: number, speakerId: number) => {
    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    // Vérifier que le speaker existe
    const speaker = await prisma.speaker.findUnique({
      where: { id: speakerId }
    });
    if (!speaker) {
      throw new Error('Intervenant non trouvé');
    }
    
    // Créer la liaison
    return await prisma.sessionSpeaker.create({
      data: {
        sessionId,
        speakerId
      },
      include: {
        session: true,
        speaker: true
      }
    });
  },
  
  removeFromSession: async (sessionId: number, speakerId: number) => {
    const relation = await prisma.sessionSpeaker.findUnique({
      where: {
        sessionId_speakerId: {
          sessionId,
          speakerId
        }
      }
    });
    
    if (!relation) {
      throw new Error('Cette association n\'existe pas');
    }
    
    return await prisma.sessionSpeaker.delete({
      where: {
        sessionId_speakerId: {
          sessionId,
          speakerId
        }
      }
    });
  },
  
  getSpeakersBySession: async (sessionId: number) => {
    return await prisma.speaker.findMany({
      where: {
        sessions: {
          some: {
            sessionId
          }
        }
      }
    });
  }
};
```
</details>

---

## 🎯 Dev D : Questions + Logique Live (4 endpoints)

### Fichiers à créer
```
src/controllers/question.controller.ts
src/services/question.service.ts
src/routes/question.routes.ts
```

### Endpoints Question (4 endpoints)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/sessions/:sessionId/questions` | Liste des questions d'une session (triées par upvotes) | Public |
| POST | `/api/questions` | Poser une question (anonyme possible) | Public |
| PUT | `/api/questions/:id/upvote` | Upvoter une question | Public |
| DELETE | `/api/questions/:id` | Supprimer une question | Admin |

### Code à implémenter

<details>
<summary>📄 question.service.ts (Cliquez pour voir)</summary>

```typescript
import { prisma } from '../utils/prisma';

export const questionService = {
  getBySession: async (sessionId: number) => {
    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    // Vérifier si la session est live
    const now = new Date();
    const isLive = now >= session.startTime && now <= session.endTime;
    
    const questions = await prisma.question.findMany({
      where: { sessionId },
      orderBy: { upvotes: 'desc' }
    });
    
    return {
      questions,
      isLive,  // Le frontend saura si on peut poser des questions
      sessionTitle: session.title
    };
  },
  
  create: async (data: {
    content: string;
    sessionId: number;
    authorName?: string;
  }) => {
    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { id: data.sessionId }
    });
    
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    // CRITICAL: Vérifier que la session est live
    const now = new Date();
    const isLive = now >= session.startTime && now <= session.endTime;
    
    if (!isLive) {
      throw new Error('Les questions ne peuvent être posées que pendant une session live');
    }
    
    // Validation du contenu
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Le contenu de la question est requis');
    }
    
    if (data.content.length > 500) {
      throw new Error('La question ne peut pas dépasser 500 caractères');
    }
    
    return await prisma.question.create({
      data: {
        content: data.content.trim(),
        sessionId: data.sessionId,
        authorName: data.authorName?.trim() || null  // Si vide, anonyme
      },
      include: {
        session: {
          include: {
            event: true
          }
        }
      }
    });
  },
  
  upvote: async (id: number) => {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        session: true
      }
    });
    
    if (!question) {
      throw new Error('Question non trouvée');
    }
    
    // Optionnel: Vérifier que la session est encore live
    const now = new Date();
    const isLive = now >= question.session.startTime && now <= question.session.endTime;
    
    if (!isLive) {
      throw new Error('Les upvotes ne sont plus acceptés car la session est terminée');
    }
    
    return await prisma.question.update({
      where: { id },
      data: {
        upvotes: {
          increment: 1
        }
      }
    });
  },
  
  delete: async (id: number) => {
    const question = await prisma.question.findUnique({ where: { id } });
    
    if (!question) {
      throw new Error('Question non trouvée');
    }
    
    return await prisma.question.delete({ where: { id } });
  }
};
```
</details>

<details>
<summary>📄 question.controller.ts (Cliquez pour voir)</summary>

```typescript
import { Request, Response } from 'express';
import { questionService } from '../services/question.service';

export const questionController = {
  getBySession: async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const result = await questionService.getBySession(sessionId);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },
  
  create: async (req: Request, res: Response) => {
    try {
      const { content, sessionId, authorName } = req.body;
      
      const question = await questionService.create({
        content,
        sessionId: parseInt(sessionId),
        authorName
      });
      
      res.status(201).json({ data: question });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
  
  upvote: async (req: Request, res: Response) => {
    try {
      const question = await questionService.upvote(parseInt(req.params.id));
      res.json({ data: question });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
  
  delete: async (req: Request, res: Response) => {
    try {
      await questionService.delete(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
};
```
</details>

---

## 🔧 Fichier Commun à Modifier (`src/index.ts`)

**ATTENTION**: Ce fichier sera modifié par TOUS les développeurs. Pour éviter les conflits, communiquez !

### Version finale après que tout le monde ait ajouté ses routes

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Dev A - Events
import eventRoutes from './routes/event.routes';

// Dev B - Sessions & Rooms
import sessionRoutes from './routes/session.routes';
import roomRoutes from './routes/room.routes';

// Dev C - Speakers
import speakerRoutes from './routes/speaker.routes';

// Dev D - Questions
import questionRoutes from './routes/question.routes';

import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend EventSync fonctionne !' });
});

// Routes
app.use('/api/events', eventRoutes);      // Dev A
app.use('/api/sessions', sessionRoutes);  // Dev B
app.use('/api/rooms', roomRoutes);        // Dev B
app.use('/api/speakers', speakerRoutes);  // Dev C
app.use('/api/questions', questionRoutes); // Dev D

// Middleware d'erreur
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## 📋 Instructions pour Éviter les Conflits

### 1. **Stratégie de Branches**

Chaque développeur crée sa propre branche à partir de `main` :

```bash
# Dev A
git checkout -b feature/events-crud

# Dev B
git checkout -b feature/sessions-rooms-crud

# Dev C
git checkout -b feature/speakers-crud

# Dev D
git checkout -b feature/questions-crud
```

### 2. **Ordre de Merge (CRITIQUE)**

Pour éviter les conflits sur `schema.prisma` et `index.ts`, mergez dans cet ordre :

1. **Dev A** (Events) - Le plus simple, peu de dépendances
2. **Dev B** (Sessions) - Dépend d'Events
3. **Dev C** (Speakers) - Dépend de Sessions
4. **Dev D** (Questions) - Dépend de Sessions

### 3. **Communication pour les Fichiers Communs**

Créez un canal Slack/Discord `#backend-sync` pour annoncer :

```
⚠️ Je vais modifier index.ts pour ajouter mes routes dans 10 minutes
⚠️ Je vais modifier schema.prisma pour ajouter mon modèle
```

### 4. **Checklist avant de commencer à coder**

Chaque développeur doit :

```bash
# 1. Vérifier que tout est à jour
git checkout main
git pull origin main

# 2. Créer sa branche
git checkout -b feature/ma-fonctionnalite

# 3. S'assurer que Prisma fonctionne
npx prisma generate
npx prisma db push

# 4. Lancer le serveur
npm run dev
```

### 5. **Pendant le développement**

```bash
# Faire des commits réguliers
git add src/services/mon-service.ts
git commit -m "feat: add create method for events"

# Pousser sa branche régulièrement (même si pas fini)
git push origin feature/ma-fonctionnalite
```

### 6. **Pull Request Template**

Créez `.github/pull_request_template.md` :

```markdown
## Description
[Description des changements]

## Type de changement
- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Refactoring

## Endpoints ajoutés/modifiés
- `GET /api/xxx`
- `POST /api/xxx`

## Tests effectués
- [ ] Testé en local avec curl/Postman
- [ ] Vérifié avec Prisma Studio

## Breaking changes
- [ ] Oui
- [ ] Non

## Checklist
- [ ] Le code passe les tests
- [ ] La documentation est mise à jour
```

---

## ✅ Résumé pour l'Équipe

| Dev | Branche | Fichiers uniques | Fichiers communs |
|-----|---------|-----------------|------------------|
| A | `feature/events-crud` | `event.*` | `index.ts`, `schema.prisma` (Event) |
| B | `feature/sessions-rooms-crud` | `session.*`, `room.*` | `index.ts`, `schema.prisma` (Session, Room) |
| C | `feature/speakers-crud` | `speaker.*` | `index.ts`, `schema.prisma` (Speaker, SessionSpeaker) |
| D | `feature/questions-crud` | `question.*` | `index.ts`, `schema.prisma` (Question) |

**Règle d'or**: Communiquez avant de toucher `index.ts` ou `schema.prisma` !

Chaque développeur peut travailler **indépendamment** sur sa branche sans se bloquer mutuellement. Les merges se feront un par un dans l'ordre défini.