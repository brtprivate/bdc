import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 1737;

// Configure proper MIME types
app.use((req, res, next) => {
  // Set proper MIME types for assets
  if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  } else if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.path.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (req.path.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  } else if (req.path.endsWith('.ico')) {
    res.setHeader('Content-Type', 'image/x-icon');
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
});

// Serve React app static assets from /app route with proper options
app.use('/app', express.static(join(__dirname, '../dist'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Serve BDC stack static files from root
app.use('/', express.static(join(__dirname, 'bdcstack'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Handle React app routing - serve index.html for any /app/* routes that don't match static files
app.get('/app/*', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Handle root route - serve BDC stack index.html
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(join(__dirname, 'bdcstack/index.html'));
});

// Fallback for any missing assets - return 404 with proper content type
app.use('/app/assets/*', (req, res) => {
  res.status(404).json({
    error: 'Asset not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    routes: {
      bdcstack: '/',
      reactApp: '/app',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ================================');
  console.log('🎯 BDC Stack Static Server Started');
  console.log('🚀 ================================');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 BDC Stack: http://localhost:${PORT}/`);
  console.log(`🔗 React App: http://localhost:${PORT}/app`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log('🚀 ================================\n');
});

export default app;