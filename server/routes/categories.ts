import { Router } from 'express';
import { db } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const categoriesRouter = Router();

// Public: List all food categories
categoriesRouter.get('/', async (_req, res) => {
  try {
    const categories = await db.getCategories();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve food categories.' });
  }
});

// Admin: Add a new category
categoriesRouter.post('/', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, sort_order } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory = await db.createCategory({
      name: name.trim(),
      slug,
      description: description || '',
      sort_order: Number(sort_order) || 10,
    });

    res.status(201).json({
      message: 'Category created successfully!',
      category: newCategory,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});
