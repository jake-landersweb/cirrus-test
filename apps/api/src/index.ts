import express from 'express';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/farewell', (_req, res) => {
  res.json({ message: 'Farewell!' });
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
