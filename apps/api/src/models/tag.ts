import { query } from '../db/client.js';
import type { Tag, CreateTagInput } from '@cirrus-test/shared';

export async function findAllTags(): Promise<Tag[]> {
  const result = await query<Tag>(
    'SELECT * FROM tags ORDER BY name ASC'
  );
  return result.rows;
}

export async function findTagById(id: string): Promise<Tag | null> {
  const result = await query<Tag>(
    'SELECT * FROM tags WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findTagBySlug(slug: string): Promise<Tag | null> {
  const result = await query<Tag>(
    'SELECT * FROM tags WHERE slug = $1',
    [slug]
  );
  return result.rows[0] ?? null;
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const result = await query<Tag>(
    `INSERT INTO tags (name, slug, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.name, slug, input.description ?? null]
  );
  if (!result.rows[0]) {
    throw new Error('Failed to create tag');
  }
  return result.rows[0];
}

export async function deleteTag(id: string): Promise<boolean> {
  const result = await query('DELETE FROM tags WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getTagsForPost(postId: string): Promise<Tag[]> {
  const result = await query<Tag>(
    `SELECT t.*
     FROM tags t
     JOIN post_tags pt ON t.id = pt.tag_id
     WHERE pt.post_id = $1
     ORDER BY t.name ASC`,
    [postId]
  );
  return result.rows;
}

export async function addTagToPost(postId: string, tagId: string): Promise<void> {
  await query(
    'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [postId, tagId]
  );
}

export async function removeTagFromPost(postId: string, tagId: string): Promise<void> {
  await query(
    'DELETE FROM post_tags WHERE post_id = $1 AND tag_id = $2',
    [postId, tagId]
  );
}
