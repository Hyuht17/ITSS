import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import { initDemoData } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: 'error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error'
  });
});

// Initialize demo data
await initDemoData();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
