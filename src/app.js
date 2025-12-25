const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();

// CORS Configuration - Support multiple origins/applications
const configureCors = () => {
  // Get allowed origins from environment
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // If ALLOWED_ORIGINS is set, use it (comma-separated list)
  if (allowedOriginsEnv) {
    const allowedOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim());
    
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
  }

  // Development mode: allow all origins (for testing only)
  // Safety check: Never allow all in production
  if (isDevelopment && process.env.CORS_ALLOW_ALL === 'true') {
    console.warn('⚠️  WARNING: CORS_ALLOW_ALL is enabled. This should only be used in development!');
    return cors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
  }
  
  // Safety: If CORS_ALLOW_ALL is set in production, ignore it and use default
  if (!isDevelopment && process.env.CORS_ALLOW_ALL === 'true') {
    console.warn('⚠️  WARNING: CORS_ALLOW_ALL is ignored in production. Using FRONTEND_URL instead.');
  }

  // Default: use FRONTEND_URL or allow specific origins
  return cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow resources from other origins
}));
app.use(configureCors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies

// Request logging middleware - log payloads only
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log('[BACKEND ← FRONTEND] Received payload:', sanitizedBody);
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: "Dynamic Backend Running" });
});

// Test Connection Endpoint
app.get('/api/test-connection', (req, res) => {
  const responseData = { 
    success: true, 
    message: "Backend connection successful",
    timestamp: new Date().toISOString()
  };
  
  console.log('Response Data:', JSON.stringify(responseData, null, 2));
  
  res.json(responseData);
});

// Mount Routes using routes/index.js structure
const initRoutes = require('./routes');
const apiRouter = initRoutes();
app.use('/api', apiRouter);

module.exports = app;