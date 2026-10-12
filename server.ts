import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { authRouter } from './server/routes/auth.ts';
import { categoriesRouter } from './server/routes/categories.ts';
import { foodItemsRouter } from './server/routes/foodItems.ts';
import { ordersRouter } from './server/routes/orders.ts';
import { adminRouter } from './server/routes/admin.ts';
import { db, checkSupabaseSchema } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // REST API Endpoints
  app.get('/api/health', async (_req, res) => {
    const dbStatus = await db.getDatabaseStatus();
    res.json({
      status: 'healthy',
      app: 'FDelivery API',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  app.get('/api/database/status', async (_req, res) => {
    const status = await db.getDatabaseStatus();
    res.json(status);
  });

  app.post('/api/database/recheck', async (_req, res) => {
    const status = await checkSupabaseSchema();
    res.json({
      message: status.ready
        ? 'Supabase schema verified and connected!'
        : 'Supabase connected, but schema tables are not yet created. Run supabase-schema.sql in Supabase SQL editor.',
      status,
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/food-items', foodItemsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/admin', adminRouter);

  // Centralized 404 for unhandled API calls
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Centralized Error Handling Middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error occurred.',
    });
  });

  // Frontend integration: Vite middleware in dev, static dist in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FDelivery] Full-stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`[FDelivery] Storefront & Admin: http://localhost:${PORT}`);
    console.log(`[FDelivery] REST API base: http://localhost:${PORT}/api`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
