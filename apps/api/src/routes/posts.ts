import { Router, type Router as RouterType } from 'express';
import * as PostModel from '../models/post.js';
import * as CommentModel from '../models/comment.js';
import * as TagModel from '../models/tag.js';
import { postCreateSchema, postUpdateSchema, commentCreateSchema } from '@cirrus-test/shared';

const router: RouterType = Router();

// GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { status, author_id, limit, offset } = req.query;
    const posts = await PostModel.findAllPosts({
      status: status as string | undefined,
      authorId: author_id as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await PostModel.findPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await PostModel.incrementViewCount(req.params.id);

    // Fetch tags
    const tags = await TagModel.getTagsForPost(req.params.id);

    res.json({ ...post, tags });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// GET /api/posts/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await PostModel.findPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await PostModel.incrementViewCount(post.id);
    const tags = await TagModel.getTagsForPost(post.id);

    res.json({ ...post, tags });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts
router.post('/', async (req, res) => {
  try {
    const input = postCreateSchema.parse(req.body);
    const post = await PostModel.createPost(input);

    // Add tags if provided
    if (req.body.tag_ids && Array.isArray(req.body.tag_ids)) {
      for (const tagId of req.body.tag_ids) {
        await TagModel.addTagToPost(post.id, tagId);
      }
    }

    res.status(201).json(post);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error });
    }
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PATCH /api/posts/:id
router.patch('/:id', async (req, res) => {
  try {
    const input = postUpdateSchema.parse(req.body);
    const post = await PostModel.updatePost(req.params.id, input);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error });
    }
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await PostModel.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// GET /api/posts/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await CommentModel.findCommentsByPostId(req.params.id);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const input = commentCreateSchema.parse({
      ...req.body,
      post_id: req.params.id,
    });
    const comment = await CommentModel.createComment(input);
    res.status(201).json(comment);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error });
    }
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// POST /api/posts/:id/tags/:tagId
router.post('/:id/tags/:tagId', async (req, res) => {
  try {
    await TagModel.addTagToPost(req.params.id, req.params.tagId);
    res.status(204).send();
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// DELETE /api/posts/:id/tags/:tagId
router.delete('/:id/tags/:tagId', async (req, res) => {
  try {
    await TagModel.removeTagFromPost(req.params.id, req.params.tagId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

export default router;
