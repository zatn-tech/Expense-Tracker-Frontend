#!/usr/bin/env node

/**
 * Build optimization script for Expense Tracker
 * This script helps optimize the production build for better Lighthouse scores
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build optimization...');

// Create optimized build configuration
const optimizeBuild = () => {
  const buildPath = path.join(__dirname, '..', 'build');
  
  if (!fs.existsSync(buildPath)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Optimize static assets
  console.log('📦 Optimizing static assets...');
  
  // Add preload hints to index.html
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Add preload hints for critical resources
    const preloadHints = `
    <link rel="preload" href="/static/js/runtime-main.js" as="script">
    <link rel="preload" href="/static/js/main.js" as="script">
    <link rel="preload" href="/static/css/main.css" as="style">
    `;
    
    htmlContent = htmlContent.replace(
      '<head>',
      `<head>${preloadHints}`
    );
    
    // Add resource hints
    const resourceHints = `
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="//fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="//fonts.gstatic.com" crossorigin>
    `;
    
    htmlContent = htmlContent.replace(
      '</head>',
      `${resourceHints}</head>`
    );
    
    fs.writeFileSync(indexPath, htmlContent);
    console.log('✅ Added preload hints to index.html');
  }

  console.log('🎉 Build optimization completed!');
};

// Run optimization
optimizeBuild();