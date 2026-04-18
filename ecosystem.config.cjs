/**
 * PM2 Ecosystem Configuration for XDoxs
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 reload ecosystem.config.cjs --update-env
 *   pm2 stop xdoxs
 *   pm2 logs xdoxs
 */

module.exports = {
  apps: [
    {
      name: 'xdoxs',
      script: 'start.mjs',
      interpreter: 'node',
      instances: 'max',           // Use all CPU cores (cluster mode)
      exec_mode: 'cluster',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 4322,
        HOST: '0.0.0.0',
      },

      // Auto-restart
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 5000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      
      // Logging
      error_file: '/opt/xdoxs/logs/error.log',
      out_file: '/opt/xdoxs/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto-rotate logs
      max_size: '10M',
      retain: 5,
    },
  ],
};
