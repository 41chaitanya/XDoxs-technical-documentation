/**
 * MongoDB-Only Testing Script
 * 
 * This script ensures S3 is disabled for pure MongoDB testing
 * All docs will be stored in MongoDB Compass only
 * 
 * Usage: npm run test-mongo
 */

import { spawn } from 'child_process';

console.log('🧪 Starting MongoDB-only testing mode...\n');
console.log('📝 Configuration:');
console.log('   - S3: DISABLED');
console.log('   - Storage: MongoDB only');
console.log('   - All docs will appear in MongoDB Compass\n');

// Set environment variables to disable S3
const env = {
  ...process.env,
  ENABLE_S3_LOCAL: 'false',
  NODE_ENV: 'development',
};

// Remove AWS credentials from environment to ensure S3 is not used
delete env.AWS_ACCESS_KEY_ID;
delete env.AWS_SECRET_ACCESS_KEY;
delete env.AWS_REGION;
delete env.S3_DOCS_BUCKET;

console.log('🚀 Building and starting preview server...\n');

// Run build first
const build = spawn('npm', ['run', 'build'], {
  env,
  stdio: 'inherit',
  shell: true,
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code || 1);
  }

  console.log('\n✅ Build complete! Starting preview server...\n');

  // Then run preview
  const preview = spawn('npm', ['run', 'preview'], {
    env,
    stdio: 'inherit',
    shell: true,
  });

  preview.on('close', (previewCode) => {
    process.exit(previewCode || 0);
  });
});
