const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Cache configuration
const cacheOptions = {
  // Static assets (JS, CSS, images) - cache for 1 year
  static: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Add cache control headers
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      
      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
  },
  
  // HTML files - cache for 1 hour
  html: {
    maxAge: 60 * 60 * 1000, // 1 hour
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
};

// Serve static assets with long cache lifetime
app.use('/static', express.static(path.join(__dirname, 'build/static'), cacheOptions.static));

// Serve manifest and other assets
app.use('/manifest.json', express.static(path.join(__dirname, 'build/manifest.json'), cacheOptions.static));
app.use('/favicon.ico', express.static(path.join(__dirname, 'build/favicon.ico'), cacheOptions.static));
app.use('/logo192.png', express.static(path.join(__dirname, 'build/logo192.png'), cacheOptions.static));
app.use('/logo512.png', express.static(path.join(__dirname, 'build/logo512.png'), cacheOptions.static));

// Serve service worker with no cache
app.use('/sw.js', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}, express.static(path.join(__dirname, 'build/sw.js')));

// API routes (if any)
app.use('/api', (req, res, next) => {
  // API responses should not be cached
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Serve index.html with appropriate cache headers
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache for HTML
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'build')}`);
  console.log(`🗂️  Static assets cached for 1 year`);
  console.log(`📄 HTML files cached for 1 hour`);
  console.log(`🔧 Service worker has no cache`);
});

module.exports = app;


