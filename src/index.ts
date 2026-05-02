import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des routes (à décommenter au fur et à mesure)
// import eventRoutes from './routes/event.routes';
// import sessionRoutes from './routes/session.routes';
// import speakerRoutes from './routes/speaker.routes';
// import roomRoutes from './routes/room.routes';
 import questionRoutes from './routes/question.routes';

import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/events', eventRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/speakers', speakerRoutes);
// app.use('/api/rooms', roomRoutes);
app.use('/api/questions', questionRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend EventSync fonctionne !' });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

