module.exports = {
  apps: [
    {
      name: 'isafari-backend',
      script: './backend/server.js',
      cwd: '/home/danford/Documents/isafari_global',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      error_file: './backend/logs/error.log',
      out_file: './backend/logs/out.log',
      log_file: './backend/logs/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
