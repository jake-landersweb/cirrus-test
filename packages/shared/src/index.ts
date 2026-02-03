import { z } from 'zod';

// ============ User Types ============

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const userCreateSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
  password_hash: z.string().min(1),
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

export type CreateUserInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});

export type UpdateUserInput = z.infer<typeof userUpdateSchema>;

// ============ Post Types ============

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: PostStatus;
  published_at: Date | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostWithAuthor extends Post {
  author: UserAuthor;
}

export interface PostWithTags extends PostWithAuthor {
  tags: Tag[];
}

export const postCreateSchema = z.object({
  author_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export type CreatePostInput = z.infer<typeof postCreateSchema>;

export const postUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export type UpdatePostInput = z.infer<typeof postUpdateSchema>;

// ============ Comment Types ============

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommentWithAuthor extends Comment {
  author: UserAuthor;
}

export const commentCreateSchema = z.object({
  post_id: z.string().uuid(),
  author_id: z.string().uuid(),
  parent_id: z.string().uuid().optional(),
  content: z.string().min(1).max(5000),
});

export type CreateCommentInput = z.infer<typeof commentCreateSchema>;

// ============ Tag Types ============

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
}

export const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export type CreateTagInput = z.infer<typeof tagCreateSchema>;

// ============ API Response Types ============

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

export interface HelloResponse {
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

// ============ Utility Functions ============

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const iso = d.toISOString();
  return iso.slice(0, 10);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
