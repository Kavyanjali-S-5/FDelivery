import { Router } from 'express';
import { db, VALID_ORDER_STATUSES } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

export const adminRouter = Router();

// Apply requireAdmin to all admin endpoints
adminRouter.use(requireAdmin);

// Admin dashboard statistics
adminRouter.get('/stats', async (_req: AuthenticatedRequest, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
});

// Admin: View all customer orders
adminRouter.get('/orders', async (_req: AuthenticatedRequest, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// Admin: Update order status (including transitions to "Delivered" without OTP)
adminRouter.patch('/orders/:id/status', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`,
      });
      return;
    }

    const currentOrder = await db.getOrderById(req.params.id);
    if (!currentOrder) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const result = await db.updateOrderStatus(req.params.id, status);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Order status updated to "${status}".`,
      order: result.order,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Admin: View customers list with spending data
adminRouter.get('/customers', async (_req: AuthenticatedRequest, res) => {
  try {
    const customers = await db.getAllCustomers();
    res.json({ customers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});
