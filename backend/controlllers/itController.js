const os = require('os');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Get comprehensive system metrics
 */
exports.getSystemMetrics = async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        hostname: os.hostname(),
        type: os.type(),
        release: os.release()
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg(),
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      },
      network: {
        interfaces: Object.keys(os.networkInterfaces()).length,
        primaryInterface: Object.keys(os.networkInterfaces())[0]
      },
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform
      }
    };

    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: req.__('admin.error_system_health'),
      error: error.message
    });
  }
};

/**
 * Get database performance metrics
 */
exports.getDatabaseMetrics = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    // Get collection statistics
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
          indexes: collStats.nindexes,
          indexSize: collStats.totalIndexSize
        });
      } catch (error) {
        collectionStats.push({
          name: collection.name,
          error: error.message
        });
      }
    }

    // Get slow query logs if available
    let slowQueries = [];
    try {
      const slowQueryLog = await db.collection('system.profile').find({}).limit(10).toArray();
      slowQueries = slowQueryLog.map(query => ({
        op: query.op,
        ns: query.ns,
        millis: query.millis,
        ts: query.ts
      }));
    } catch (error) {
      // Slow query logging might not be enabled
    }

    const metrics = {
      timestamp: new Date(),
      connection: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
        states: {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        }
      },
      stats,
      collections: collectionStats,
      slowQueries
    };

    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching database metrics',
      error: error.message
    });
  }
};

/**
 * Get application performance metrics
 */
exports.getApplicationMetrics = async (req, res) => {
  try {
    // Get request statistics from middleware if available
    const requestStats = global.requestStats || {
      totalRequests: 0,
      activeRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    };

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageFormatted = {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
    };

    // Get CPU usage
    const cpuUsage = process.cpuUsage();
    const cpuUsageFormatted = {
      user: `${(cpuUsage.user / 1000000).toFixed(2)}s`,
      system: `${(cpuUsage.system / 1000000).toFixed(2)}s`
    };

    const metrics = {
      timestamp: new Date(),
      uptime: {
        process: process.uptime(),
        system: os.uptime(),
        formatted: {
          process: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
          system: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`
        }
      },
      memory: memoryUsageFormatted,
      cpu: cpuUsageFormatted,
      requests: requestStats,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        database: process.env.MONGODB_URI ? 'configured' : 'not configured'
      }
    };

    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching application metrics',
      error: error.message
    });
  }
};

/**
 * Get real-time monitoring data
 */
exports.getRealTimeMetrics = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    let socketMetrics = {
      connectedUsers: 0,
      adminUsers: 0,
      totalConnections: 0,
      rooms: []
    };

    if (io) {
      const sockets = io.sockets.sockets;
      socketMetrics = {
        connectedUsers: sockets.size,
        adminUsers: io.sockets.adapter.rooms.get('admin_room')?.size || 0,
        totalConnections: sockets.size,
        rooms: Array.from(io.sockets.adapter.rooms.keys())
      };
    }

    // Get current system load
    const loadAvg = os.loadavg();
    const loadMetrics = {
      '1min': loadAvg[0],
      '5min': loadAvg[1],
      '15min': loadAvg[2],
      status: loadAvg[0] > os.cpus().length ? 'high' : 'normal'
    };

    const metrics = {
      timestamp: new Date(),
      sockets: socketMetrics,
      system: {
        load: loadMetrics,
        memory: {
          usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
          free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
          used: `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`
        }
      }
    };

    res.json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching real-time metrics',
      error: error.message
    });
  }
};

/**
 * Get error logs and statistics
 */
exports.getErrorLogs = async (req, res) => {
  try {
    const { level = 'error', limit = 50, startDate, endDate } = req.query;
    const logDir = path.join(__dirname, '../logs');
    
    let logs = [];
    
    try {
      const logFiles = await fs.readdir(logDir);
      
      for (const file of logFiles) {
        if (file.endsWith('.log')) {
          const logPath = path.join(logDir, file);
          const content = await fs.readFile(logPath, 'utf8');
          
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
            .filter(entry => entry !== null && entry.level === level);
          
          logs = logs.concat(entries);
        }
      }
    } catch (error) {
      // Log directory might not exist
    }
    
    // Filter by date range
    if (startDate) {
      logs = logs.filter(log => log.timestamp >= new Date(startDate));
    }
    
    if (endDate) {
      logs = logs.filter(log => log.timestamp <= new Date(endDate));
    }
    
    // Sort by timestamp and limit
    logs.sort((a, b) => b.timestamp - a.timestamp);
    logs = logs.slice(0, parseInt(limit));
    
    // Group errors by type
    const errorStats = logs.reduce((acc, log) => {
      const key = log.message.split(':')[0] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      status: 'success',
      data: {
        logs,
        stats: {
          total: logs.length,
          byType: errorStats,
          level,
          dateRange: { startDate, endDate }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching error logs',
      error: error.message
    });
  }
};

/**
 * Create database backup
 */
exports.createBackup = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.gz`;
    const backupPath = path.join(backupDir, backupFile);
    
    // Create backup directory if it doesn't exist
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    const mongoUri = process.env.MONGODB_URI;
    const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('WARNING')) {
      throw new Error(stderr);
    }
    
    const stats = await fs.stat(backupPath);
    
    res.json({
      status: 'success',
      message: 'Backup created successfully',
      data: {
        backupFile,
        backupPath,
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating backup',
      error: error.message
    });
  }
};

/**
 * List available backups
 */
exports.listBackups = async (req, res) => {
  try {
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
            sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
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
};

/**
 * Restore database from backup
 */
exports.restoreBackup = async (req, res) => {
  try {
    const { backupFile } = req.body;
    
    if (!backupFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Backup file name is required'
      });
    }
    
    const backupDir = path.join(__dirname, '../backups');
    const backupPath = path.join(backupDir, backupFile);
    
    // Check if backup file exists
    try {
      await fs.access(backupPath);
    } catch {
      return res.status(404).json({
        status: 'error',
        message: 'Backup file not found'
      });
    }
    
    const mongoUri = process.env.MONGODB_URI;
    const command = `mongorestore --uri="${mongoUri}" --archive="${backupPath}" --gzip --drop`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('WARNING')) {
      throw new Error(stderr);
    }
    
    res.json({
      status: 'success',
      message: 'Database restored successfully',
      data: {
        backupFile,
        restoredAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error restoring backup',
      error: error.message
    });
  }
};

/**
 * Get system configuration
 */
exports.getSystemConfig = async (req, res) => {
  try {
    const config = {
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      database: {
        uri: process.env.MONGODB_URI ? 'configured' : 'not configured',
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      },
      email: {
        service: process.env.EMAIL_SERVICE ? 'configured' : 'not configured'
      },
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured'
      },
      jwt: {
        secret: process.env.JWT_SECRET ? 'configured' : 'not configured',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      },
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000'
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      }
    };
    
    res.json({
      status: 'success',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching system configuration',
      error: error.message
    });
  }
}; 