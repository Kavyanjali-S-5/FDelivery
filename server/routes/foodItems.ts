import { Router } from 'express';
import { db } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const foodItemsRouter = Router();

// Public: Get food items with optional category and search filters
foodItemsRouter.get('/', async (req, res) => {
  try {
    const { category, search, available_only } = req.query;
    const items = await db.getFoodItems({
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      availableOnly: available_only === 'false' ? false : true,
    });
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve food items.' });
  }
});

// Public: Get single item details
foodItemsRouter.get('/:id', async (req, res) => {
  try {
    const item = await db.getFoodItemById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Food item not found.' });
      return;
    }
    res.json({ item });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve food item details.' });
  }
});

// Admin: Create food item
foodItemsRouter.post('/', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, category_id, description, price, image_url, rating, is_available } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Food item name is required.' });
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400).json({ error: 'Valid positive price is required.' });
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
    const newItem = await db.createFoodItem({
      name: name.trim(),
      category_id: category_id || 'cat-1',
      description: description ? description.trim() : '',
      price: numPrice,
      image_url: image_url ? image_url.trim() : defaultImg,
      rating: Number(rating) || 4.8,
      is_available: is_available !== false,
    });

    res.status(201).json({
      message: 'Food item created successfully!',
      item: newItem,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create food item.' });
  }
});

// Admin: Update food item
foodItemsRouter.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, category_id, description, price, image_url, rating, is_available } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name.trim();
    if (category_id !== undefined) updates.category_id = category_id;
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400).json({ error: 'Valid price is required.' });
        return;
      }
      updates.price = numPrice;
    }
    if (image_url !== undefined) updates.image_url = image_url.trim();
    if (rating !== undefined) updates.rating = Number(rating);
    if (is_available !== undefined) updates.is_available = Boolean(is_available);

    const updated = await db.updateFoodItem(req.params.id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Food item not found.' });
      return;
    }

    res.json({
      message: 'Food item updated successfully!',
      item: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update food item.' });
  }
});

// Admin: Delete food item
foodItemsRouter.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await db.deleteFoodItem(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Food item not found.' });
      return;
    }
    res.json({ message: 'Food item deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete food item.' });
  }
});
