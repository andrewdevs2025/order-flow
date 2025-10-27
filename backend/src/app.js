import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router as logRoutes } from './routes/index.js';
import { router as orderRoutes } from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', logRoutes);
app.use('/api/v1', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nexa Order Flow API server running on http://localhost:${PORT}`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
  console.log('📁 Upload directory: ./uploads');
  console.log(`🗄️  Database: PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`);
});
