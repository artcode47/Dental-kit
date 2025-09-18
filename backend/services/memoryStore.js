const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class MemoryStore {
  constructor() {
    this.store = new Map();
    this.ttlStore = new Map(); // Track expiration times
    this.cleanupInterval = null;
    this.persistenceInterval = null;
    this.dataDir = path.join(__dirname, '../data');
    this.persistenceFile = path.join(this.dataDir, 'memory-store.json');
    
    this.initialize();
  }

  async initialize() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Load persisted data
      await this.loadFromDisk();
      
      // Start cleanup interval (every 5 minutes)
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpired();
      }, 5 * 60 * 1000);
      
      // Start persistence interval (every 10 minutes)
      this.persistenceInterval = setInterval(() => {
        this.persistToDisk();
      }, 10 * 60 * 1000);
      
      console.log('Memory store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize memory store:', error);
    }
  }

  // Load data from disk
  async loadFromDisk() {
    try {
      const data = await fs.readFile(this.persistenceFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Restore store and TTL data
      this.store = new Map(parsed.store || []);
      this.ttlStore = new Map(parsed.ttl || []);
      
      console.log(`Loaded ${this.store.size} items from disk`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading from disk:', error);
      }
    }
  }

  // Persist data to disk
  async persistToDisk() {
    try {
      const data = {
        store: Array.from(this.store.entries()),
        ttl: Array.from(this.ttlStore.entries()),
        timestamp: Date.now()
      };
      
      await fs.writeFile(this.persistenceFile, JSON.stringify(data, null, 2));
      console.log(`Persisted ${this.store.size} items to disk`);
    } catch (error) {
      console.error('Error persisting to disk:', error);
    }
  }

  // Set key with TTL
  set(key, value, ttlSeconds = 3600) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    this.store.set(key, value);
    this.ttlStore.set(key, expiresAt);
    
    return true;
  }

  // Set key with expiration time
  setEx(key, ttlSeconds, value) {
    return this.set(key, value, ttlSeconds);
  }

  // Get key value
  get(key) {
    const value = this.store.get(key);
    if (!value) return null;
    
    // Check if expired
    const expiresAt = this.ttlStore.get(key);
    if (expiresAt && expiresAt < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return value;
  }

  // Delete key
  delete(key) {
    this.store.delete(key);
    this.ttlStore.delete(key);
    return true;
  }

  // Check if key exists
  has(key) {
    if (!this.store.has(key)) return false;
    
    // Check if expired
    const expiresAt = this.ttlStore.get(key);
    if (expiresAt && expiresAt < Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Get TTL for key
  ttl(key) {
    if (!this.has(key)) return -2; // Key doesn't exist
    if (!this.ttlStore.has(key)) return -1; // No TTL
    
    const expiresAt = this.ttlStore.get(key);
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    
    return remaining > 0 ? remaining : -1;
  }

  // Set expiration for existing key
  expire(key, ttlSeconds) {
    if (!this.store.has(key)) return false;
    
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.ttlStore.set(key, expiresAt);
    return true;
  }

  // Get all keys matching pattern (simplified pattern matching)
  keys(pattern = '*') {
    const keys = Array.from(this.store.keys());
    
    if (pattern === '*') return keys;
    
    // Simple pattern matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  // Get store size
  size() {
    return this.store.size;
  }

  // Clear all data
  clear() {
    this.store.clear();
    this.ttlStore.clear();
    return true;
  }

  // Cleanup expired entries
  cleanupExpired() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, expiresAt] of this.ttlStore.entries()) {
      if (expiresAt < now) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired entries`);
    }
    
    return cleanedCount;
  }

  // Get memory usage info
  getMemoryInfo() {
    const used = process.memoryUsage();
    return {
      storeSize: this.store.size,
      ttlSize: this.ttlStore.size,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100
    };
  }

  // Health check
  async healthCheck() {
    try {
      const start = Date.now();
      
      // Simple operation to test functionality
      const testKey = '__health_check__';
      this.set(testKey, 'test', 1);
      const result = this.get(testKey);
      this.delete(testKey);
      
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        memoryInfo: this.getMemoryInfo()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Graceful shutdown
  async shutdown() {
    try {
      // Clear intervals
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      if (this.persistenceInterval) {
        clearInterval(this.persistenceInterval);
      }
      
      // Final persistence
      await this.persistToDisk();
      
      console.log('Memory store shutdown completed');
    } catch (error) {
      console.error('Error during memory store shutdown:', error);
    }
  }
}

// Create singleton instance
const memoryStore = new MemoryStore();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('Shutting down memory store...');
  await memoryStore.shutdown();
});

process.on('SIGTERM', async () => {
  console.log('Shutting down memory store...');
  await memoryStore.shutdown();
});

module.exports = memoryStore;
