import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import ethereumRoutes from './routes/ethereum';
import { rateLimiter } from './middleware/validation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); 
app.use(cors()); 
app.use(morgan('combined')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Rate limiting
app.use(rateLimiter(60000, 100));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ethereum API Server is running',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Ethereum API v1.0.0',
    endpoints: {
      'GET /api/ethereum/:address': 'Get complete Ethereum data (gas price, block number, balance) for an address',
      'GET /api/ethereum/network/gas-price': 'Get current gas price in Gwei',
      'GET /api/ethereum/network/block-number': 'Get current block number',
      'GET /api/ethereum/balance/:address': 'Get balance for specific address',
      'GET /health': 'Health check endpoint'
    },
    timestamp: Date.now()
  });
});

// Routes
app.use('/api/ethereum', ethereumRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: Date.now()
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: Date.now()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ethereum API Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;