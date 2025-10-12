// Performance optimization utilities

import { lazy } from 'react';

// Lazy load components with preloading
export const lazyWithPreload = (importFunction) => {
  const Component = lazy(importFunction);
  
  // Preload the component
  Component.preload = importFunction;
  
  return Component;
};

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance optimization
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Intersection Observer for lazy loading images
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Prefetch resources for better performance
export const prefetchResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  
  return result;
};

// Async performance monitoring
export const measureAsyncPerformance = async (name, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  
  return result;
};

// Bundle analyzer helper
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
  }
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576 * 100) / 100,
      total: Math.round(performance.memory.totalJSHeapSize / 1048576 * 100) / 100,
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576 * 100) / 100
    };
  }
  return null;
};

// Critical resource hints
export const addResourceHints = () => {
  // Preconnect to external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://ui-avatars.com'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
        })
        .catch(registrationError => {
        });
    });
  }
};

// Web Vitals monitoring
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Image lazy loading utility
export const lazyLoadImage = (img, src) => {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        image.classList.remove('lazy');
        observer.unobserve(image);
      }
    });
  });
  
  observer.observe(img);
};

// Virtual scrolling helper
export const createVirtualScroll = (container, itemHeight, renderItem) => {
  let scrollTop = 0;
  let containerHeight = 0;
  let totalItems = 0;
  
  const updateVisibleItems = () => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      totalItems
    );
    
    return { startIndex, endIndex };
  };
  
  const handleScroll = throttle(() => {
    scrollTop = container.scrollTop;
    const { startIndex, endIndex } = updateVisibleItems();
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      renderItem(i);
    }
  }, 16); // ~60fps
  
  container.addEventListener('scroll', handleScroll);
  
  return {
    updateVisibleItems,
    destroy: () => container.removeEventListener('scroll', handleScroll)
  };
};

export default {
  lazyWithPreload,
  debounce,
  throttle,
  memoize,
  createIntersectionObserver,
  preloadResource,
  prefetchResource,
  measurePerformance,
  measureAsyncPerformance,
  analyzeBundle,
  getMemoryUsage,
  addResourceHints,
  registerServiceWorker,
  reportWebVitals,
  lazyLoadImage,
  createVirtualScroll
};


