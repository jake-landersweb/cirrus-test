import express from 'express';
import { config } from './config.js';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import tagsRouter from './routes/tags.js';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Legacy routes for backwards compatibility
app.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/farewell', (_req, res) => {
  res.json({ message: 'Farewell!' });
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/tags', tagsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (!config.isTest) {
  app.listen(config.port, () => {
    console.log(`API server listening on port ${config.port}`);
  });
}

export { app };
