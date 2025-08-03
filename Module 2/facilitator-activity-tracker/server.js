require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import configurations and models
const db = require('./models');
const redisClient = require('./config/redis');

// Import routes
const authRoutes = require('./routes/auth');
const activityTrackerRoutes = require('./routes/activityTracker');
const notificationRoutes = require('./routes/notifications');

// Import services
const notificationService = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.sequelize.authenticate();
    
    // Check Redis connection
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityTrackerRoutes);
app.use('/api/notifications', notificationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Facilitator Activity Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password',
        'GET /api/auth/users': 'Get all users (managers+)',
        'PUT /api/auth/users/:id': 'Update user (admin only)'
      },
      activities: {
        'POST /api/activities': 'Create/update activity tracker',
        'GET /api/activities': 'Get activity trackers',
        'GET /api/activities/summary': 'Get activity summary',
        'GET /api/activities/:id': 'Get single activity tracker',
        'PUT /api/activities/:id': 'Update activity tracker',
        'DELETE /api/activities/:id': 'Delete activity tracker'
      },
      notifications: {
        'GET /api/notifications': 'Get user notifications',
        'POST /api/notifications/mark-read': 'Mark notifications as read',
        'POST /api/notifications/send': 'Send notification (managers+)',
        'POST /api/notifications/schedule-reminders': 'Schedule reminders (managers+)',
        'GET /api/notifications/queue-stats': 'Get queue stats (admin only)'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  
  server.close(async () => {
    try {
      // Close database connections
      await db.sequelize.close();
      console.log('Database connection closed.');
      
      // Close Redis connection
      await redisClient.quit();
      console.log('Redis connection closed.');
      
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(PORT, async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Test Redis connection
    await redisClient.ping();
    console.log('✅ Redis connection established successfully.');
    
    console.log(`🚀 Facilitator Activity Tracker API running on port ${PORT}`);
    console.log(`📚 API documentation available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    
    // Initialize notification service
    console.log('🔔 Notification service initialized');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

module.exports = app;
