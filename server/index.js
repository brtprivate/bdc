import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 1737;

// Configure comprehensive MIME types and mobile-friendly headers
app.use((req, res, next) => {
  // Comprehensive MIME type mapping
  const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.jsx': 'application/javascript',
    '.ts': 'application/javascript',
    '.tsx': 'application/javascript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip'
  };

  // Set proper MIME type based on file extension
  const ext = req.path.toLowerCase().substring(req.path.lastIndexOf('.'));
  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }

  // Special handling for JavaScript modules
  if (req.path.includes('/assets/') && (req.path.endsWith('.js') || req.path.endsWith('.mjs'))) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // Special handling for CSS files
  if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  // Allow wallet connections and mobile apps
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Mobile-specific headers for better wallet compatibility
  if (req.path.startsWith('/app')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    // Cache static assets for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  }

  // Allow iframe embedding for wallet modals (important for mobile wallets)
  res.setHeader('X-Frame-Options', 'ALLOWALL');

  next();
});

// Serve React app static assets from /app route with comprehensive options
app.use('/app', express.static(join(__dirname, '../dist'), {
  maxAge: '1d',
  etag: false,
  index: false, // Don't serve index.html automatically
  setHeaders: (res, path, stat) => {
    // Comprehensive MIME type setting for static files
    const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
    const mimeTypes = {
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };

    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }

    // Ensure no MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Special handling for JavaScript files
    if (ext === '.js' || ext === '.mjs') {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    // Special handling for CSS files
    if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    // No cache for HTML files
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Serve BDC stack static files from root with proper MIME types
app.use('/', express.static(join(__dirname, 'bdcstack'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path, stat) => {
    // Fix MIME types for BDC stack files
    const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
    const mimeTypes = {
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript',
      '.txt': 'text/plain; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };

    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }

    // Ensure no MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Fix for .txt files being served as JavaScript
    if (ext === '.txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }

    // Fix for CSS files
    if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }

    // Fix for JavaScript files
    if (ext === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Special handling for wallet connection requests
app.use('/app', (req, res, next) => {
  // Add mobile wallet-specific headers
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');

  // Allow all origins for wallet connections
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
});

// Handle missing assets with proper error responses
app.get('/app/assets/*', (req, res) => {
  // If asset not found, return 404 with proper MIME type
  const ext = req.path.toLowerCase().substring(req.path.lastIndexOf('.'));
  const mimeTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }

  res.status(404).send(`/* Asset not found: ${req.path} */`);
});

// Handle React app routing - serve index.html for any /app/* routes that don't match static files
app.get('/app/*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Mobile-specific headers for wallet compatibility
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *; frame-src *; connect-src *;');

  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Handle missing favicon and common assets
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.status(404).send('');
});

app.get('/usdstack-logo.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.status(404).send('');
});

app.get('/main.tsx', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.status(404).send('// File not found');
});

// Handle missing CSS and JS files with proper MIME types
app.get('*.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.status(404).send('/* CSS file not found */');
});

app.get('*.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.status(404).send('// JavaScript file not found');
});

// Handle root route - serve BDC stack index.html
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
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