import { Router } from 'express';
import * as UserModel from '../models/user.js';
import { userCreateSchema, userUpdateSchema } from '@cirrus-test/shared';

const router = Router();

// GET /api/users
router.get('/', async (_req, res) => {
  try {
    const users = await UserModel.findAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/count
router.get('/count', async (_req, res) => {
  try {
    const count = await UserModel.getUserCount();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const input = userCreateSchema.parse(req.body);

    // Check for existing email
    const existingEmail = await UserModel.findUserByEmail(input.email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Check for existing username
    const existingUsername = await UserModel.findUserByUsername(input.username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await UserModel.createUser(input);
    res.status(201).json(user);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
  try {
    const input = userUpdateSchema.parse(req.body);
    const user = await UserModel.updateUser(req.params.id, input);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await UserModel.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
