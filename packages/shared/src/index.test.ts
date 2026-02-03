import { describe, it, expect } from 'vitest';
import {
  slugify,
  formatDate,
  truncate,
  userCreateSchema,
  postCreateSchema,
  commentCreateSchema,
  tagCreateSchema,
} from './index.js';

describe('Utility functions', () => {
  describe('slugify', () => {
    it('should convert text to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('my blog post')).toBe('my-blog-post');
    });

    it('should remove special characters', () => {
      expect(slugify("What's New?")).toBe('what-s-new');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(slugify('---hello---')).toBe('hello');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('hello    world')).toBe('hello-world');
    });
  });

  describe('formatDate', () => {
    it('should format a Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should format a date string', () => {
      expect(formatDate('2024-03-20T00:00:00Z')).toBe('2024-03-20');
    });
  });

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long text with ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });

    it('should handle exact length', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });
});

describe('Validation schemas', () => {
  describe('userCreateSchema', () => {
    it('should validate valid user input', () => {
      const result = userCreateSchema.safeParse({
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = userCreateSchema.safeParse({
        email: 'invalid-email',
        username: 'testuser',
        password_hash: 'hashedpassword',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const result = userCreateSchema.safeParse({
        email: 'test@example.com',
        username: 'ab',
        password_hash: 'hashedpassword',
      });
      expect(result.success).toBe(false);
    });

    it('should reject username with invalid characters', () => {
      const result = userCreateSchema.safeParse({
        email: 'test@example.com',
        username: 'test user',
        password_hash: 'hashedpassword',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('postCreateSchema', () => {
    it('should validate valid post input', () => {
      const result = postCreateSchema.safeParse({
        author_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'My Post',
        content: 'This is the content',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = postCreateSchema.safeParse({
        author_id: '550e8400-e29b-41d4-a716-446655440000',
        title: '',
        content: 'This is the content',
      });
      expect(result.success).toBe(false);
    });

    it('should default status to draft', () => {
      const result = postCreateSchema.safeParse({
        author_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'My Post',
        content: 'Content',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft');
      }
    });
  });

  describe('commentCreateSchema', () => {
    it('should validate valid comment input', () => {
      const result = commentCreateSchema.safeParse({
        post_id: '550e8400-e29b-41d4-a716-446655440000',
        author_id: '550e8400-e29b-41d4-a716-446655440001',
        content: 'Great post!',
      });
      expect(result.success).toBe(true);
    });

    it('should allow optional parent_id', () => {
      const result = commentCreateSchema.safeParse({
        post_id: '550e8400-e29b-41d4-a716-446655440000',
        author_id: '550e8400-e29b-41d4-a716-446655440001',
        parent_id: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Reply!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const result = commentCreateSchema.safeParse({
        post_id: '550e8400-e29b-41d4-a716-446655440000',
        author_id: '550e8400-e29b-41d4-a716-446655440001',
        content: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tagCreateSchema', () => {
    it('should validate valid tag input', () => {
      const result = tagCreateSchema.safeParse({
        name: 'TypeScript',
      });
      expect(result.success).toBe(true);
    });

    it('should allow optional description', () => {
      const result = tagCreateSchema.safeParse({
        name: 'TypeScript',
        description: 'A typed superset of JavaScript',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = tagCreateSchema.safeParse({
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
