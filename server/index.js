import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 1737;

// Serve React app static assets from /app route
app.use('/app', express.static(join(__dirname, '../dist')));

// Serve BDC stack static files from root
app.use('/', express.static(join(__dirname, 'bdcstack')));

// Handle React app routing - serve index.html for any /app/* routes that don't match static files
app.get('/app/*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Handle root route - serve BDC stack index.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'bdcstack/index.html'));
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