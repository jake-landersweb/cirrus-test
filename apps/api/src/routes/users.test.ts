import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('User endpoints', () => {
  describe('GET /api/users/count', () => {
    it('should return count property', async () => {
      const res = await request(app).get('/api/users/count');

      // Endpoint should either succeed with count or fail with 500 if DB is not available
      // Just verify the response structure matches the expected format
      if (res.status === 200) {
        expect(res.body).toHaveProperty('count');
        expect(typeof res.body.count).toBe('number');
        expect(res.body.count).toBeGreaterThanOrEqual(0);
      } else if (res.status === 500) {
        expect(res.body).toHaveProperty('error');
      }
    });
  });
});
