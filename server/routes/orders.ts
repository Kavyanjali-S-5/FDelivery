import { Router, Response } from 'express';
import { db } from '../db.ts';
import { optionalAuth, authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';

export const ordersRouter = Router();

// Calculate server-side quote / verified prices for checkout
ordersRouter.post('/quote', async (req, res): Promise<void> => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty. Please add items to proceed.' });
      return;
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const food = await db.getFoodItemById(item.food_item_id);
      if (!food) {
        res.status(400).json({ error: `Item with ID ${item.food_item_id} does not exist.` });
        return;
      }
      if (!food.is_available) {
        res.status(400).json({ error: `"${food.name}" is currently sold out or unavailable.` });
        return;
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({ error: `Invalid quantity for "${food.name}".` });
        return;
      }

      const itemTotal = Math.round(food.price * qty * 100) / 100;
      subtotal += itemTotal;

      verifiedItems.push({
        food_item_id: food.id,
        name: food.name,
        unit_price: food.price,
        quantity: qty,
        total_price: itemTotal,
        image_url: food.image_url,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const delivery_fee = subtotal >= 50.0 ? 0.0 : 4.99;
    const total_amount = Math.round((subtotal + delivery_fee) * 100) / 100;

    res.json({
      subtotal,
      delivery_fee,
      total_amount,
      items: verifiedItems,
      is_free_delivery: subtotal >= 50.0,
      free_delivery_threshold: 50.0,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to calculate order quote.' });
  }
});

// Place new order
ordersRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      customer_name,
      customer_email,
      phone,
      address,
      city,
      zip,
      deliveryTime,
      notes,
      items,
    } = req.body;

    const resolvedName = customer_name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName);
    const resolvedEmail = customer_email || (req.user ? req.user.email : '');
    const resolvedPhone = phone || (req.user ? req.user.phone : '');
    const resolvedAddress = address || (req.user ? req.user.address : '');
    const resolvedCity = city || (req.user ? req.user.city : '');
    const resolvedZip = zip || (req.user ? req.user.zip : '');

    if (!resolvedName || !resolvedPhone || !resolvedAddress || !resolvedCity || !resolvedZip) {
      res.status(400).json({
        error: 'Missing delivery information: Name, phone, address, city, and zip are required.',
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    const { order } = await db.createOrder({
      user_id: req.user ? req.user.id : undefined,
      customer_name: resolvedName,
      customer_email: resolvedEmail || 'guest@fdelivery.com',
      customer_phone: resolvedPhone,
      delivery_address: resolvedAddress,
      city: resolvedCity,
      zip: resolvedZip,
      delivery_time: deliveryTime || 'ASAP',
      notes: notes || '',
      items,
    });

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (err: any) {
    console.error('[Orders] Create order error:', err);
    res.status(400).json({ error: err.message || 'Failed to place order.' });
  }
});

// Customer's order history
ordersRouter.get('/my-orders', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const orders = await db.getUserOrders(req.user.id, req.user.email);
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve your order history.' });
  }
});

// Track order by ID or order_number
ordersRouter.get('/track/:id', async (req, res): Promise<void> => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found with that order number or ID.' });
      return;
    }

    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to track order.' });
  }
});
