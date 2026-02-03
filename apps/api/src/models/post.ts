import { query } from '../db/client.js';
import type { Post, CreatePostInput, UpdatePostInput, PostWithAuthor } from '@cirrus-test/shared';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function findAllPosts(options?: { status?: string; authorId?: string; limit?: number; offset?: number }): Promise<PostWithAuthor[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (options?.status) {
    conditions.push(`p.status = $${paramIndex++}`);
    params.push(options.status);
  }

  if (options?.authorId) {
    conditions.push(`p.author_id = $${paramIndex++}`);
    params.push(options.authorId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(options?.limit ?? 20);
  params.push(options?.offset ?? 0);

  const result = await query<PostWithAuthor>(
    `SELECT
       p.id, p.author_id, p.title, p.slug, p.content, p.excerpt, p.status,
       p.published_at, p.view_count, p.created_at, p.updated_at,
       json_build_object(
         'id', u.id,
         'username', u.username,
         'display_name', u.display_name,
         'avatar_url', u.avatar_url
       ) as author
     FROM posts p
     JOIN users u ON p.author_id = u.id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );
  return result.rows;
}

export async function findPostById(id: string): Promise<PostWithAuthor | null> {
  const result = await query<PostWithAuthor>(
    `SELECT
       p.id, p.author_id, p.title, p.slug, p.content, p.excerpt, p.status,
       p.published_at, p.view_count, p.created_at, p.updated_at,
       json_build_object(
         'id', u.id,
         'username', u.username,
         'display_name', u.display_name,
         'avatar_url', u.avatar_url
       ) as author
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  const result = await query<PostWithAuthor>(
    `SELECT
       p.id, p.author_id, p.title, p.slug, p.content, p.excerpt, p.status,
       p.published_at, p.view_count, p.created_at, p.updated_at,
       json_build_object(
         'id', u.id,
         'username', u.username,
         'display_name', u.display_name,
         'avatar_url', u.avatar_url
       ) as author
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.slug = $1`,
    [slug]
  );
  return result.rows[0] ?? null;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const slug = slugify(input.title);
  const excerpt = input.excerpt ?? input.content.slice(0, 200) + '...';

  const result = await query<Post>(
    `INSERT INTO posts (author_id, title, slug, content, excerpt, status, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.author_id,
      input.title,
      slug,
      input.content,
      excerpt,
      input.status ?? 'draft',
      input.status === 'published' ? new Date() : null,
    ]
  );
  return result.rows[0];
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(input.title);
    fields.push(`slug = $${paramIndex++}`);
    values.push(slugify(input.title));
  }
  if (input.content !== undefined) {
    fields.push(`content = $${paramIndex++}`);
    values.push(input.content);
    if (!input.excerpt) {
      fields.push(`excerpt = $${paramIndex++}`);
      values.push(input.content.slice(0, 200) + '...');
    }
  }
  if (input.excerpt !== undefined) {
    fields.push(`excerpt = $${paramIndex++}`);
    values.push(input.excerpt);
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(input.status);
    if (input.status === 'published') {
      fields.push(`published_at = COALESCE(published_at, NOW())`);
    }
  }

  if (fields.length === 0) {
    const result = await query<Post>('SELECT * FROM posts WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }

  values.push(id);
  const result = await query<Post>(
    `UPDATE posts
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deletePost(id: string): Promise<boolean> {
  const result = await query('DELETE FROM posts WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function incrementViewCount(id: string): Promise<void> {
  await query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);
}
