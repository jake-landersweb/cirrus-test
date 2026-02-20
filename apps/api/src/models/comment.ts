import { query } from '../db/client.js';
import type { Comment, CreateCommentInput, CommentWithAuthor } from '@cirrus-test/shared';

export async function findCommentsByPostId(postId: string): Promise<CommentWithAuthor[]> {
  const result = await query<CommentWithAuthor>(
    `SELECT
       c.id, c.post_id, c.author_id, c.parent_id, c.content, c.is_edited, c.created_at, c.updated_at,
       json_build_object(
         'id', u.id,
         'username', u.username,
         'display_name', u.display_name,
         'avatar_url', u.avatar_url
       ) as author
     FROM comments c
     JOIN users u ON c.author_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
}

export async function findCommentById(id: string): Promise<CommentWithAuthor | null> {
  const result = await query<CommentWithAuthor>(
    `SELECT
       c.id, c.post_id, c.author_id, c.parent_id, c.content, c.is_edited, c.created_at, c.updated_at,
       json_build_object(
         'id', u.id,
         'username', u.username,
         'display_name', u.display_name,
         'avatar_url', u.avatar_url
       ) as author
     FROM comments c
     JOIN users u ON c.author_id = u.id
     WHERE c.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const result = await query<Comment>(
    `INSERT INTO comments (post_id, author_id, parent_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.post_id, input.author_id, input.parent_id ?? null, input.content]
  );
  return result.rows[0]!;
}

export async function updateComment(id: string, content: string): Promise<Comment | null> {
  const result = await query<Comment>(
    `UPDATE comments
     SET content = $1, is_edited = true
     WHERE id = $2
     RETURNING *`,
    [content, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteComment(id: string): Promise<boolean> {
  const result = await query('DELETE FROM comments WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getCommentCount(postId: string): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM comments WHERE post_id = $1',
    [postId]
  );
  return parseInt(result.rows[0]!.count, 10);
}
