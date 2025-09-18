const memoryStore = require('./memoryStore');
const advancedMemoryStore = require('./advancedMemoryStore');

class UnifiedStore {
  constructor() {
    this.isConnected = true; // Always connected for built-in store
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  // Connection methods (for compatibility with Redis API)
  async connect() {
    // Always connected for built-in store
    this.isConnected = true;
    console.log('Unified store connected (built-in memory store)');
    return true;
  }

  async disconnect() {
    // Graceful shutdown
    await this.shutdown();
    this.isConnected = false;
    console.log('Unified store disconnected');
  }

  // Basic Key-Value Operations
  async set(key, value, options = {}) {
    try {
      if (options.EX) {
        // Set with expiration in seconds
        return memoryStore.set(key, value, options.EX);
      } else if (options.PX) {
        // Set with expiration in milliseconds
        return memoryStore.set(key, value, Math.floor(options.PX / 1000));
      } else {
        // Set without expiration
        return memoryStore.set(key, value);
      }
    } catch (error) {
      console.error('Error setting key:', error);
      return false;
    }
  }

  async setEx(key, ttlSeconds, value) {
    return memoryStore.setEx(key, ttlSeconds, value);
  }

  async get(key) {
    try {
      return memoryStore.get(key);
    } catch (error) {
      console.error('Error getting key:', error);
      return null;
    }
  }

  async del(key) {
    try {
      return memoryStore.delete(key);
    } catch (error) {
      console.error('Error deleting key:', error);
      return false;
    }
  }

  async exists(key) {
    return memoryStore.has(key) ? 1 : 0;
  }

  async expire(key, ttlSeconds) {
    return memoryStore.expire(key, ttlSeconds);
  }

  async ttl(key) {
    return memoryStore.ttl(key);
  }

  async keys(pattern = '*') {
    return memoryStore.keys(pattern);
  }

  // Sorted Set Operations (for rate limiting)
  async zAdd(key, score, value) {
    try {
      return advancedMemoryStore.zAdd(key, score, value);
    } catch (error) {
      console.error('Error adding to sorted set:', error);
      return 0;
    }
  }

  async zRemRangeByScore(key, min, max) {
    try {
      return advancedMemoryStore.zRemRangeByScore(key, min, max);
    } catch (error) {
      console.error('Error removing from sorted set by score:', error);
      return 0;
    }
  }

  async zCard(key) {
    try {
      return advancedMemoryStore.zCard(key);
    } catch (error) {
      console.error('Error getting sorted set cardinality:', error);
      return 0;
    }
  }

  async zRevRange(key, start, stop) {
    try {
      return advancedMemoryStore.zRevRange(key, start, stop);
    } catch (error) {
      console.error('Error getting sorted set range:', error);
      return [];
    }
  }

  async zRange(key, start, stop) {
    try {
      return advancedMemoryStore.zRange(key, start, stop);
    } catch (error) {
      console.error('Error getting sorted set range:', error);
      return [];
    }
  }

  // CSRF Token Management
  async setCSRFToken(sessionId, token, expiry = 86400000) {
    try {
      const ttlSeconds = Math.ceil(expiry / 1000);
      return await this.setEx(`csrf:${sessionId}`, ttlSeconds, JSON.stringify({
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiry
      }));
    } catch (error) {
      console.error('Error setting CSRF token:', error);
      return false;
    }
  }

  async getCSRFToken(sessionId) {
    try {
      const data = await this.get(`csrf:${sessionId}`);
      if (!data) return null;
      
      const tokenData = JSON.parse(data);
      
      // Check if token is expired
      if (tokenData.expiresAt < Date.now()) {
        await this.del(`csrf:${sessionId}`);
        return null;
      }
      
      return tokenData;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      return null;
    }
  }

  async deleteCSRFToken(sessionId) {
    try {
      return await this.del(`csrf:${sessionId}`);
    } catch (error) {
      console.error('Error deleting CSRF token:', error);
      return false;
    }
  }

  // Rate Limiting
  async incrementRateLimit(key, windowMs = 60000, maxRequests = 100) {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Use sorted set for sliding window rate limiting
      const rateLimitKey = `rate_limit:${key}`;
      
      // Add current timestamp
      await this.zAdd(rateLimitKey, now, now.toString());
      
      // Remove expired entries
      await this.zRemRangeByScore(rateLimitKey, 0, windowStart);
      
      // Get current count
      const count = await this.zCard(rateLimitKey);
      
      // Set expiry on the key (convert to seconds)
      await this.expire(rateLimitKey, Math.ceil(windowMs / 1000));
      
      const remaining = Math.max(0, maxRequests - count);
      const allowed = count < maxRequests;
      
      return {
        allowed,
        remaining,
        resetTime: now + windowMs,
        currentCount: count
      };
    } catch (error) {
      console.error('Error incrementing rate limit:', error);
      return { allowed: true, remaining: maxRequests };
    }
  }

  async getRateLimitInfo(key) {
    try {
      const rateLimitKey = `rate_limit:${key}`;
      const count = await this.zCard(rateLimitKey);
      const ttl = await this.ttl(rateLimitKey);
      
      return {
        currentCount: count,
        ttl,
        resetTime: Date.now() + (ttl * 1000)
      };
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return null;
    }
  }

  // Session Management
  async setSession(sessionId, sessionData, expiry = 3600000) {
    try {
      const ttlSeconds = Math.ceil(expiry / 1000);
      return await this.setEx(`session:${sessionId}`, ttlSeconds, JSON.stringify({
        ...sessionData,
        createdAt: Date.now(),
        expiresAt: Date.now() + expiry
      }));
    } catch (error) {
      console.error('Error setting session:', error);
      return false;
    }
  }

  async getSession(sessionId) {
    try {
      const data = await this.get(`session:${sessionId}`);
      if (!data) return null;
      
      const sessionData = JSON.parse(data);
      
      // Check if session is expired
      if (sessionData.expiresAt < Date.now()) {
        await this.del(`session:${sessionId}`);
        return null;
      }
      
      return sessionData;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async deleteSession(sessionId) {
    try {
      return await this.del(`session:${sessionId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // User Activity Tracking
  async trackUserActivity(userId, activity) {
    try {
      const key = `user_activity:${userId}`;
      const activityData = {
        ...activity,
        timestamp: Date.now()
      };
      
      // Add to sorted set (sorted by timestamp)
      await this.zAdd(key, activityData.timestamp, JSON.stringify(activityData));
      
      // Keep only last 100 activities
      const count = await this.zCard(key);
      if (count > 100) {
        // Remove oldest entries beyond 100
        const entries = await this.zRange(key, 0, count - 101);
        for (const entry of entries) {
          await this.zRemRangeByScore(key, 0, 0); // Remove by score 0
        }
      }
      
      // Set expiry (24 hours)
      await this.expire(key, 86400);
      
      return true;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      return false;
    }
  }

  async getUserActivity(userId, limit = 50) {
    try {
      const key = `user_activity:${userId}`;
      const activities = await this.zRevRange(key, 0, limit - 1);
      
      return activities.map(activity => JSON.parse(activity));
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  // Cache Management
  async setCache(key, data, ttl = 3600) {
    try {
      return await this.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  async getCache(key) {
    try {
      const data = await this.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async deleteCache(key) {
    try {
      return await this.del(key);
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  async clearCache(pattern = '*') {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        for (const key of keys) {
          await this.del(key);
        }
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const start = Date.now();
      
      // Test basic operations
      const testKey = '__health_check__';
      await this.set(testKey, 'test', { EX: 1 });
      const result = await this.get(testKey);
      await this.del(testKey);
      
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        memoryInfo: this.getMemoryInfo(),
        testResult: result === 'test'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get memory usage info
  getMemoryInfo() {
    const baseInfo = memoryStore.getMemoryInfo();
    const advancedInfo = advancedMemoryStore.getMemoryInfo();
    
    return {
      ...baseInfo,
      ...advancedInfo
    };
  }

  // Cleanup expired data
  async cleanup() {
    try {
      // Trigger cleanup in both stores
      memoryStore.cleanupExpired();
      advancedMemoryStore.cleanupExpiredSortedSets();
      
      console.log('Unified store cleanup completed');
      return true;
    } catch (error) {
      console.error('Error during unified store cleanup:', error);
      return false;
    }
  }

  // Graceful shutdown
  async shutdown() {
    try {
      await memoryStore.shutdown();
      await advancedMemoryStore.shutdown();
      console.log('Unified store shutdown completed');
    } catch (error) {
      console.error('Error during unified store shutdown:', error);
    }
  }
}

// Create singleton instance
const unifiedStore = new UnifiedStore();

// Graceful shutdown
process.on('SIGINT', async () => {
  await unifiedStore.shutdown();
});

process.on('SIGTERM', async () => {
  await unifiedStore.shutdown();
});

module.exports = unifiedStore;
