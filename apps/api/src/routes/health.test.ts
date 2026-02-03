import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('Health endpoints', () => {
  describe('GET /health', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /', () => {
    it('should return hello world message', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Hello World' });
    });
  });

  describe('GET /farewell', () => {
    it('should return farewell message', async () => {
      const res = await request(app).get('/farewell');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Farewell!' });
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Not found' });
    });
  });
});
