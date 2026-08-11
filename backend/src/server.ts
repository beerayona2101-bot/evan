import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import { connectDB } from './config/db';
import { seedDatabase } from './utils/seedData';
import { initSocket } from './config/socket';

const INITIAL_PORT: number = Number(process.env.PORT) || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    if (mongoose.connection.readyState === 1) {
      seedDatabase().catch((err) => console.warn('[Seed] Skipped seeding:', err.message));
    }
  });

  const startServer = (port: number) => {
    const server = http.createServer(app);
    initSocket(server);

    server.listen(port, () => {
      console.log(`[Kanchanika Server & Socket.IO] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${port}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Kanchanika Server] Port ${port} is in use, trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('[Kanchanika Server] Startup Error:', err);
      }
    });
  };

  startServer(INITIAL_PORT);
}
