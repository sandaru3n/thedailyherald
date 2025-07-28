#!/usr/bin/env node

// Suppress Fast Refresh messages
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'development';

// Override console methods to filter out Fast Refresh messages
const originalLog = console.log;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = (...args) => {
  const message = args.join(' ');
  if (!message.includes('[Fast Refresh]') && 
      !message.includes('report-hmr-latency') && 
      !message.includes('AD TRACKER BETA') &&
      !message.includes('Header Bidding Platform Detection') &&
      !message.includes('Checking for header bidding')) {
    originalLog(...args);
  }
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (!message.includes('[Fast Refresh]') && 
      !message.includes('report-hmr-latency') &&
      !message.includes('AD TRACKER BETA') &&
      !message.includes('Header Bidding Platform Detection')) {
    originalWarn(...args);
  }
};

console.info = (...args) => {
  const message = args.join(' ');
  if (!message.includes('[Fast Refresh]') && 
      !message.includes('report-hmr-latency') &&
      !message.includes('AD TRACKER BETA') &&
      !message.includes('Header Bidding Platform Detection')) {
    originalInfo(...args);
  }
};

// Start Next.js development server
const { spawn } = require('child_process');
const nextDev = spawn('npx', ['next', 'dev', '-H', '0.0.0.0', '--turbopack'], {
  stdio: 'inherit',
  shell: true
});

nextDev.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
}); 