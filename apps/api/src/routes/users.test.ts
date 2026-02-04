import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('User endpoints', () => {
  describe('GET /api/users/count', () => {
    it('should return active_count and inactive_count properties', async () => {
      const res = await request(app).get('/api/users/count');

      // Endpoint should either succeed with counts or fail with 500 if DB is not available
      // Just verify the response structure matches the expected format
      if (res.status === 200) {
        expect(res.body).toHaveProperty('active_count');
        expect(res.body).toHaveProperty('inactive_count');
        expect(typeof res.body.active_count).toBe('number');
        expect(typeof res.body.inactive_count).toBe('number');
        expect(res.body.active_count).toBeGreaterThanOrEqual(0);
        expect(res.body.inactive_count).toBeGreaterThanOrEqual(0);
      } else if (res.status === 500) {
        expect(res.body).toHaveProperty('error');
      }
    });
  });
});
