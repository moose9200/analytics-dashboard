import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { pool } from './services/database.js';
import { redisClient } from './services/redis.js';
import apiRouter from './api/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    const redisPing = await redisClient.ping();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      redis: redisPing === 'PONG' ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error) });
  }
});

app.use('/api', apiRouter);

async function startServer() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'disconnected',
        config JSONB DEFAULT '{}',
        credentials_encrypted JSONB DEFAULT '{}',
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Database tables initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;