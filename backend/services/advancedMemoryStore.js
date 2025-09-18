const memoryStore = require('./memoryStore');

class AdvancedMemoryStore {
  constructor() {
    this.sortedSets = new Map(); // Store sorted sets for rate limiting
    this.cleanupInterval = null;
    
    this.initialize();
  }

  initialize() {
    // Start cleanup interval for sorted sets (every 2 minutes)
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSortedSets();
    }, 2 * 60 * 1000);
    
    console.log('Advanced memory store initialized');
  }

  // Sorted Set Operations (for rate limiting)
  
  // Add member to sorted set with score
  zAdd(key, score, value) {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map());
    }
    
    const sortedSet = this.sortedSets.get(key);
    sortedSet.set(value, score);
    
    return 1; // Return number of new elements added
  }

  // Remove members from sorted set by score range
  zRemRangeByScore(key, min, max) {
    if (!this.sortedSets.has(key)) return 0;
    
    const sortedSet = this.sortedSets.get(key);
    let removedCount = 0;
    
    for (const [value, score] of sortedSet.entries()) {
      if (score >= min && score <= max) {
        sortedSet.delete(value);
        removedCount++;
      }
    }
    
    return removedCount;
  }

  // Get cardinality (size) of sorted set
  zCard(key) {
    if (!this.sortedSets.has(key)) return 0;
    return this.sortedSets.get(key).size;
  }

  // Get members from sorted set by rank (reverse order)
  zRevRange(key, start, stop) {
    if (!this.sortedSets.has(key)) return [];
    
    const sortedSet = this.sortedSets.get(key);
    const entries = Array.from(sortedSet.entries());
    
    // Sort by score in descending order
    entries.sort((a, b) => b[1] - a[1]);
    
    // Apply range
    const startIndex = start < 0 ? entries.length + start : start;
    const stopIndex = stop < 0 ? entries.length + stop : stop;
    
    return entries
      .slice(startIndex, stopIndex + 1)
      .map(([value, score]) => value);
  }

  // Get members from sorted set by rank (ascending order)
  zRange(key, start, stop) {
    if (!this.sortedSets.has(key)) return [];
    
    const sortedSet = this.sortedSets.get(key);
    const entries = Array.from(sortedSet.entries());
    
    // Sort by score in ascending order
    entries.sort((a, b) => a[1] - b[1]);
    
    // Apply range
    const startIndex = start < 0 ? entries.length + start : start;
    const stopIndex = stop < 0 ? entries.length + stop : stop;
    
    return entries
      .slice(startIndex, stopIndex + 1)
      .map(([value, score]) => value);
  }

  // Remove sorted set
  del(key) {
    return this.sortedSets.delete(key) ? 1 : 0;
  }

  // Check if key exists
  exists(key) {
    return this.sortedSets.has(key) ? 1 : 0;
  }

  // Cleanup expired sorted sets
  cleanupExpiredSortedSets() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, sortedSet] of this.sortedSets.entries()) {
      // Remove entries older than 1 hour (for rate limiting)
      const oneHourAgo = now - (60 * 60 * 1000);
      const removed = this.zRemRangeByScore(key, 0, oneHourAgo);
      
      if (removed > 0) {
        cleanedCount += removed;
      }
      
      // Remove empty sorted sets
      if (sortedSet.size === 0) {
        this.sortedSets.delete(key);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sorted set entries`);
    }
    
    return cleanedCount;
  }

  // Get sorted set info
  getSortedSetInfo(key) {
    if (!this.sortedSets.has(key)) return null;
    
    const sortedSet = this.sortedSets.get(key);
    return {
      size: sortedSet.size,
      keys: Array.from(sortedSet.keys()),
      scores: Array.from(sortedSet.values())
    };
  }

  // Get all sorted set keys
  getSortedSetKeys() {
    return Array.from(this.sortedSets.keys());
  }

  // Clear all sorted sets
  clearSortedSets() {
    this.sortedSets.clear();
    return true;
  }

  // Get memory usage info including sorted sets
  getMemoryInfo() {
    const baseInfo = memoryStore.getMemoryInfo();
    const sortedSetCount = this.sortedSets.size;
    let totalSortedSetEntries = 0;
    
    for (const sortedSet of this.sortedSets.values()) {
      totalSortedSetEntries += sortedSet.size;
    }
    
    return {
      ...baseInfo,
      sortedSetCount,
      totalSortedSetEntries
    };
  }

  // Health check including sorted sets
  async healthCheck() {
    try {
      const start = Date.now();
      
      // Test sorted set operations
      const testKey = '__health_check_sorted__';
      this.zAdd(testKey, Date.now(), 'test');
      const size = this.zCard(testKey);
      this.del(testKey);
      
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        memoryInfo: this.getMemoryInfo(),
        sortedSetTest: size === 1
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
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      
      // Clear all sorted sets
      this.clearSortedSets();
      
      console.log('Advanced memory store shutdown completed');
    } catch (error) {
      console.error('Error during advanced memory store shutdown:', error);
    }
  }
}

// Create singleton instance
const advancedMemoryStore = new AdvancedMemoryStore();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  await advancedMemoryStore.shutdown();
});

process.on('SIGTERM', async () => {
  await advancedMemoryStore.shutdown();
});

module.exports = advancedMemoryStore;
