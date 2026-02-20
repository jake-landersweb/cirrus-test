import { Router, type Router as RouterType } from 'express';
import * as TagModel from '../models/tag.js';
import { tagCreateSchema } from '@cirrus-test/shared';

const router: RouterType = Router();

// GET /api/tags
router.get('/', async (_req, res) => {
  try {
    const tags = await TagModel.findAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /api/tags/:id
router.get('/:id', async (req, res) => {
  try {
    const tag = await TagModel.findTagById(req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// GET /api/tags/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const tag = await TagModel.findTagBySlug(req.params.slug);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// POST /api/tags
router.post('/', async (req, res) => {
  try {
    const input = tagCreateSchema.parse(req.body);
    const tag = await TagModel.createTag(input);
    res.status(201).json(tag);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error });
    }
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// DELETE /api/tags/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TagModel.deleteTag(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
