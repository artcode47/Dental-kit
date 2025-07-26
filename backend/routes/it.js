const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const router = express.Router();

// IT Admin middleware - only allow IT admins
const itAdminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'it_admin') {
    return res.status(403).json({
      status: 'error',
      message: req.__('admin.access_denied')
    });
  }
  next();
};

/**
 * @route   GET /api/it/dashboard
 * @desc    Get IT dashboard overview
 * @access  IT Admin only
 */
router.get('/dashboard', auth, itAdminAuth, async (req, res) => {
  try {
    const os = require('os');
    const mongoose = require('mongoose');
    
    // System information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg()
      }
    };

    // Database status
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };

    // Process information
    const processInfo = {
      pid: process.pid,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.json({
      status: 'success',
      data: {
        systemInfo,
        dbStatus,
        processInfo,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('admin.error_dashboard_stats'),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/it/health
 * @desc    Get detailed system health
 * @access  IT Admin only
 */
router.get('/health', auth, itAdminAuth, async (req, res) => {
  try {
    const os = require('os');
    const mongoose = require('mongoose');
    
    // Health checks
    const healthChecks = {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        connectionState: mongoose.connection.readyState,
        collections: Object.keys(mongoose.connection.collections).length
      },
      redis: {
        status: 'not_configured' // Will be updated if Redis is added
      },
      externalServices: {
        cloudinary: 'healthy', // Assuming Cloudinary is working
        email: 'healthy' // Assuming email service is working
      }
    };

    // Overall health status
    const overallStatus = Object.values(healthChecks).every(check => 
      check.status === 'healthy' || check.status === 'not_configured'
    ) ? 'healthy' : 'degraded';

    res.json({
      status: 'success',
      data: {
        overallStatus,
        healthChecks,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('admin.error_system_health'),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/it/performance
 * @desc    Get performance metrics
 * @access  IT Admin only
 */
router.get('/performance', auth, itAdminAuth, async (req, res) => {
  try {
    const os = require('os');
    
    // Performance metrics
    const performance = {
      cpu: {
        usage: process.cpuUsage(),
        load: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      process: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime()
      },
      network: {
        interfaces: os.networkInterfaces()
      }
    };

    res.json({
      status: 'success',
      data: performance
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('admin.error_system_health'),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/it/logs
 * @desc    Get system logs
 * @access  IT Admin only
 */
router.get('/logs', auth, itAdminAuth, [
  query('level').optional().isIn(['error', 'warn', 'info', 'debug']),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], validate, async (req, res) => {
  try {
    const { level, limit = 100, startDate, endDate } = req.query;
    const fs = require('fs').promises;
    const path = require('path');
    
    // Read log files
    const logDir = path.join(__dirname, '../logs');
    const logFiles = await fs.readdir(logDir);
    
    let logs = [];
    
    for (const file of logFiles) {
      if (file.endsWith('.log')) {
        const logPath = path.join(logDir, file);
        const content = await fs.readFile(logPath, 'utf8');
        
        // Parse log entries
        const entries = content.split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
              if (match) {
                return {
                  timestamp: new Date(match[1]),
                  level: match[2],
                  message: match[3],
                  file: file
                };
              }
              return null;
            } catch (error) {
              return null;
            }
          })
          .filter(entry => entry !== null);
        
        logs = logs.concat(entries);
      }
    }
    
    // Filter logs
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    if (startDate) {
      logs = logs.filter(log => log.timestamp >= new Date(startDate));
    }
    
    if (endDate) {
      logs = logs.filter(log => log.timestamp <= new Date(endDate));
    }
    
    // Sort by timestamp and limit
    logs.sort((a, b) => b.timestamp - a.timestamp);
    logs = logs.slice(0, parseInt(limit));
    
    res.json({
      status: 'success',
      data: {
        logs,
        total: logs.length,
        filters: { level, startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching logs',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/it/connections
 * @desc    Get active connections and socket status
 * @access  IT Admin only
 */
router.get('/connections', auth, itAdminAuth, async (req, res) => {
  try {
    // Get socket.io connections if available
    const socketHandler = require('../utils/socketHandler');
    const io = req.app.get('io'); // Assuming io is attached to app
    
    let socketInfo = {
      connectedUsers: 0,
      adminUsers: 0,
      totalConnections: 0
    };
    
    if (io) {
      const connectedUsers = io.sockets.sockets.size;
      socketInfo = {
        connectedUsers,
        adminUsers: io.sockets.adapter.rooms.get('admin_room')?.size || 0,
        totalConnections: connectedUsers
      };
    }
    
    res.json({
      status: 'success',
      data: {
        socketInfo,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching connection info',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/it/restart
 * @desc    Restart the application (development only)
 * @access  IT Admin only
 */
router.post('/restart', auth, itAdminAuth, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        status: 'error',
        message: 'Restart not allowed in production'
      });
    }
    
    // Send restart signal
    process.send('restart');
    
    res.json({
      status: 'success',
      message: 'Restart signal sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error sending restart signal',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/it/database
 * @desc    Get database statistics and operations
 * @access  IT Admin only
 */
router.get('/database', auth, itAdminAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    // Get database stats
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    const collectionStats = [];
    
    for (const collection of collections) {
      try {
        const collStats = await db.collection(collection.name).stats();
        collectionStats.push({
          name: collection.name,
          count: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          storageSize: collStats.storageSize,
          indexes: collStats.nindexes
        });
      } catch (error) {
        collectionStats.push({
          name: collection.name,
          error: error.message
        });
      }
    }
    
    res.json({
      status: 'success',
      data: {
        connection: {
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          readyState: mongoose.connection.readyState
        },
        stats,
        collections: collectionStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching database info',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/it/backup
 * @desc    Create database backup
 * @access  IT Admin only
 */
router.post('/backup', auth, itAdminAuth, async (req, res) => {
  try {
    const { exec } = require('child_process');
    const path = require('path');
    
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.gz`;
    const backupPath = path.join(backupDir, backupFile);
    
    // Create backup directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // MongoDB backup command
    const mongoUri = process.env.MONGODB_URI;
    const dbName = mongoUri.split('/').pop().split('?')[0];
    
    const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Backup failed',
          error: error.message
        });
      }
      
      res.json({
        status: 'success',
        message: 'Backup created successfully',
        data: {
          backupFile,
          backupPath,
          size: fs.statSync(backupPath).size
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating backup',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/it/backups
 * @desc    List available backups
 * @access  IT Admin only
 */
router.get('/backups', auth, itAdminAuth, async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const backupDir = path.join(__dirname, '../backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backups = [];
      
      for (const file of files) {
        if (file.endsWith('.gz')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            name: file,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        }
      }
      
      // Sort by creation date (newest first)
      backups.sort((a, b) => b.createdAt - a.createdAt);
      
      res.json({
        status: 'success',
        data: backups
      });
    } catch (error) {
      // Backup directory doesn't exist
      res.json({
        status: 'success',
        data: []
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error listing backups',
      error: error.message
    });
  }
});

module.exports = router; 