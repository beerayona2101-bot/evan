import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { seedDatabase } from './utils/seedData';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import couponRoutes from './routes/couponRoutes';
import userRoutes from './routes/userRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import aiRoutes from './routes/aiRoutes';
import uploadRoutes from './routes/uploadRoutes';
import homepageRoutes from './routes/homepageRoutes';
import revenueRoutes from './routes/revenueRoutes';
import settingsRoutes from './routes/settingsRoutes';
<<<<<<< HEAD
=======
import inquiryRoutes from './routes/inquiryRoutes';
>>>>>>> e82de53 (color and ui changed)
import { notFound, errorHandler } from './middleware/errorMiddleware';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app: Application = express();
const INITIAL_PORT: number = Number(process.env.PORT) || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

connectDB().then(() => {
  if (mongoose.connection.readyState === 1) {
    seedDatabase().catch((err) => console.warn('[Seed] Skipped seeding:', err.message));
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'EVAN COLLECTIONS Luxury Saree API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/analytics', revenueRoutes);
app.use('/api/settings', settingsRoutes);
<<<<<<< HEAD
=======
app.use('/api/inquiries', inquiryRoutes);
>>>>>>> e82de53 (color and ui changed)

// Production static file serving for unified deployment
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.use(notFound);
app.use(errorHandler);

import { initSocket } from './config/socket';

const startServer = (port: number) => {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    console.log(`[EVAN Server & Socket.IO] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[EVAN Server] Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('[EVAN Server] Startup Error:', err);
    }
  });
};

startServer(INITIAL_PORT);
