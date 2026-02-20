import { query } from '../db/client.js';
import type { User, CreateUserInput, UpdateUserInput } from '@cirrus-test/shared';

export async function findAllUsers(): Promise<User[]> {
  const result = await query<User>(
    `SELECT id, email, username, display_name, bio, avatar_url, is_active, is_admin, created_at, updated_at
     FROM users
     WHERE is_active = true
     ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT id, email, username, display_name, bio, avatar_url, is_active, is_admin, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT id, email, username, display_name, bio, avatar_url, is_active, is_admin, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT id, email, username, display_name, bio, avatar_url, is_active, is_admin, created_at, updated_at
     FROM users
     WHERE username = $1`,
    [username]
  );
  return result.rows[0] ?? null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, username, password_hash, display_name, bio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, display_name, bio, avatar_url, is_active, is_admin, created_at, updated_at`,
    [input.email, input.username, input.password_hash, input.display_name ?? null, input.bio ?? null]
  );
  return result.rows[0]!;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.display_name !== undefined) {
    fields.push(`display_name = $${paramIndex++}`);
    values.push(input.display_name);
  }
  if (input.bio !== undefined) {
    fields.push(`bio = $${paramIndex++}`);
    values.push(input.bio);
  }
  if (input.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`);
    values.push(input.avatar_url);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  const result = await query<User>(
    `UPDATE users
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, email, username, display_name, bio, avatar_url, is_active, is_admin, created_at, updated_at`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE users SET is_active = false WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getUserCount(): Promise<{ active_count: number; inactive_count: number }> {
  const result = await query<{ active_count: string; inactive_count: string }>(
    `SELECT
      COUNT(*) FILTER (WHERE is_active = true) as active_count,
      COUNT(*) FILTER (WHERE is_active = false) as inactive_count
     FROM users`
  );
  return {
    active_count: parseInt(result.rows[0]!.active_count, 10),
    inactive_count: parseInt(result.rows[0]!.inactive_count, 10)
  };
}
