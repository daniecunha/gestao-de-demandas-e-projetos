import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';

import { technologiesRouter } from './routes/technologies';
import { projectsRouter }     from './routes/projects';
import { tasksRouter }        from './routes/tasks';
import { meetingsRouter }     from './routes/meetings';
import { reportsRouter }      from './routes/reports';

const app = express();

// CORS — permite chamadas do Firebase Hosting (mesmo domínio em prod)
app.use(cors({
  origin: [
    /\.web\.app$/,
    /\.firebaseapp\.com$/,
    'http://localhost:5173',  // dev local
    'http://localhost:4000',  // Firebase Emulator UI
  ],
  credentials: true,
}));

app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────────
app.use('/api/technologies', technologiesRouter);
app.use('/api/projects',     projectsRouter);
app.use('/api/tasks',        tasksRouter);
app.use('/api/meetings',     meetingsRouter);
app.use('/api/reports',      reportsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Exporta como Cloud Function "api"
export const api = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onRequest(app);
