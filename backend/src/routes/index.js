import express from 'express';
import { databaseService } from '../services/index.js';

export const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const dbHealthy = await databaseService.healthCheck();

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Nexa Order Flow API',
      database: dbHealthy ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'Nexa Order Flow API',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Nexa Order Flow API',
    version: '1.0.0',
    description: 'Complete order management system with smart assignment and ADL validation',
    database: 'PostgreSQL',
    endpoints: {
      orders: '/api/v1/orders',
      masters: '/api/v1/masters',
      health: '/api/health'
    }
  });
});
