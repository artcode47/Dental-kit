const { db } = require('../config/firebase');
const admin = require('firebase-admin');

class FirebaseService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    
    // Check if Firebase is properly initialized
    if (!db) {
      console.error('Firebase not initialized. Database operations will fail.');
      this.collectionRef = null;
    } else {
      this.collectionRef = db.collection(collectionName);
    }
  }

  /**
   * Create a new document
   */
  async create(data) {
    try {
      if (!this.collectionRef) {
        throw new Error('Firebase not initialized');
      }
      
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await this.collectionRef.add(docData);
      return {
        id: docRef.id,
        ...docData
      };
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  /**
   * Get a document by ID
   */
  async getById(id) {
    try {
      if (!this.collectionRef) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = this.collectionRef.doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data();
        // Convert Firestore timestamps to JavaScript dates
        const convertedData = this.convertTimestamps(data);
        return {
          id: docSnap.id,
          ...convertedData
        };
      }
      return null;
    } catch (error) {
      throw new Error(`Error getting document: ${error.message}`);
    }
  }

  /**
   * Get all documents with simplified querying (no composite indexes required)
   */
  async getAll(options = {}) {
    try {
      if (!this.collectionRef) {
        throw new Error('Firebase not initialized');
      }
      
      const {
        filters = [],
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limitCount = 20,
        startAfterDoc = null
      } = options;

      // Start with basic collection reference
      let q = this.collectionRef;

      // Apply only simple equality filters (no range filters or complex combinations)
      if (Array.isArray(filters)) {
        // Only apply the first equality filter to avoid composite index requirements
        const equalityFilters = filters.filter(filter => 
          filter.operator === '==' && 
          !['createdAt', 'updatedAt', 'stock', 'price'].includes(filter.field)
        );
        
        if (equalityFilters.length > 0) {
          // Use only the first equality filter
          const firstFilter = equalityFilters[0];
          q = q.where(firstFilter.field, firstFilter.operator, firstFilter.value);
        }
      } else if (filters && typeof filters === 'object') {
        // For object filters, use only simple equality filters
        const equalityFields = Object.keys(filters).filter(key => 
          !['createdAt', 'updatedAt', 'stock', 'price', 'minPrice', 'maxPrice'].includes(key)
        );
        
        if (equalityFields.length > 0) {
          const firstField = equalityFields[0];
          q = q.where(firstField, '==', filters[firstField]);
        }
      }

      // Skip Firestore sorting to avoid composite index requirements
      // We'll sort in memory instead

      // Apply pagination
      if (startAfterDoc) {
        q = q.startAfter(startAfterDoc);
      }
      q = q.limit(limitCount);

      const querySnapshot = await q.get();
      const documents = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to JavaScript dates
        const convertedData = this.convertTimestamps(data);
        documents.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply additional filtering in memory (no composite index required)
      let filteredDocuments = documents;

      if (Array.isArray(filters)) {
        // Apply remaining filters in memory
        const memoryFilters = filters.filter(filter => 
          filter.operator !== '==' || 
          ['createdAt', 'updatedAt', 'stock', 'price'].includes(filter.field)
        );
        
        memoryFilters.forEach(filter => {
          filteredDocuments = filteredDocuments.filter(doc => {
            const value = doc[filter.field];
            switch (filter.operator) {
              case '>=':
                return value >= filter.value;
              case '<=':
                return value <= filter.value;
              case '>':
                return value > filter.value;
              case '<':
                return value < filter.value;
              case '!=':
                return value !== filter.value;
              default:
                return true;
            }
          });
        });
      } else if (filters && typeof filters === 'object') {
        // Apply object filters in memory
        const memoryFields = Object.keys(filters).filter(key => 
          ['createdAt', 'updatedAt', 'stock', 'price', 'minPrice', 'maxPrice'].includes(key)
        );
        
        memoryFields.forEach(field => {
          const value = filters[field];
          if (field === 'minPrice') {
            filteredDocuments = filteredDocuments.filter(doc => doc.price >= value);
          } else if (field === 'maxPrice') {
            filteredDocuments = filteredDocuments.filter(doc => doc.price <= value);
          } else if (value !== undefined && value !== null) {
            filteredDocuments = filteredDocuments.filter(doc => doc[field] === value);
          }
        });
      }

      // Always sort in memory to avoid composite index requirements
      filteredDocuments.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return filteredDocuments;
    } catch (error) {
      throw new Error(`Error getting documents: ${error.message}`);
    }
  }

  /**
   * Get all documents with absolutely no complex queries (guaranteed no index errors)
   */
  async getAllSimple(options = {}) {
    try {
      if (!this.collectionRef) {
        throw new Error('Firebase not initialized');
      }
      
      const { limitCount = 1000 } = options;

      // Get all documents without any filters or sorting
      const querySnapshot = await this.collectionRef.limit(limitCount).get();
      const documents = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        documents.push({
          id: doc.id,
          ...convertedData
        });
      });

      return documents;
    } catch (error) {
      throw new Error(`Error getting documents: ${error.message}`);
    }
  }

  /**
   * Update a document by ID
   */
  async update(id, data) {
    try {
      const docRef = this.collectionRef.doc(id);
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await docRef.update(updateData);
      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  /**
   * Delete a document by ID
   */
  async delete(id) {
    try {
      const docRef = this.collectionRef.doc(id);
      await docRef.delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  /**
   * Find documents by a specific field
   */
  async findBy(field, value, options = {}) {
    try {
      const filters = [{ field, operator: '==', value }];
      return await this.getAll({ ...options, filters });
    } catch (error) {
      throw new Error(`Error finding documents: ${error.message}`);
    }
  }

  /**
   * Find a single document by a specific field
   */
  async findOneBy(field, value) {
    try {
      const documents = await this.findBy(field, value, { limitCount: 1 });
      return documents.length > 0 ? documents[0] : null;
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  /**
   * Search documents by multiple fields
   */
  async search(searchTerm, searchFields = [], options = {}) {
    try {
      // For simple search, we'll use array-contains or == operators
      // For more complex search, you might want to use Algolia or similar
      const filters = searchFields.map(field => ({
        field,
        operator: '>=',
        value: searchTerm
      }));

      return await this.getAll({ ...options, filters });
    } catch (error) {
      throw new Error(`Error searching documents: ${error.message}`);
    }
  }

  /**
   * Batch create multiple documents
   */
  async batchCreate(documents) {
    try {
      const batch = db.batch();
      
      documents.forEach(docData => {
        const docRef = this.collectionRef.doc();
        const data = {
          ...docData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        batch.set(docRef, data);
      });

      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Error batch creating documents: ${error.message}`);
    }
  }

  /**
   * Batch update multiple documents
   */
  async batchUpdate(updates) {
    try {
      const batch = db.batch();
      
      updates.forEach(({ id, data }) => {
        const docRef = this.collectionRef.doc(id);
        const updateData = {
          ...data,
          updatedAt: new Date()
        };
        batch.update(docRef, updateData);
      });

      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Error batch updating documents: ${error.message}`);
    }
  }

  /**
   * Batch delete multiple documents
   */
  async batchDelete(ids) {
    try {
      const batch = db.batch();
      
      ids.forEach(id => {
        const docRef = this.collectionRef.doc(id);
        batch.delete(docRef);
      });

      await batch.commit();
      return true;
    } catch (error) {
      throw new Error(`Error batch deleting documents: ${error.message}`);
    }
  }

  /**
   * Run a transaction
   */
  async runTransaction(updateFunction) {
    try {
      return await db.runTransaction(updateFunction);
    } catch (error) {
      throw new Error(`Error running transaction: ${error.message}`);
    }
  }

  /**
   * Count documents (with optional filters)
   */
  async count(filters = []) {
    try {
      const documents = await this.getAll({ filters, limitCount: 1000 });
      return documents.length;
    } catch (error) {
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }

  /**
   * Convert Firestore timestamp to Date
   */
  static convertTimestamp(timestamp) {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return timestamp;
  }

  /**
   * Convert Date to Firestore timestamp
   */
  static toTimestamp(date) {
    if (date instanceof Date) {
      return admin.firestore.Timestamp.fromDate(date);
    }
    return date;
  }

  /**
   * Convert Firestore timestamps to JavaScript dates recursively
   */
  convertTimestamps(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj.toDate && typeof obj.toDate === 'function') {
      // This is a Firestore timestamp
      return obj.toDate();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.convertTimestamps(item));
    }

    if (typeof obj === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = this.convertTimestamps(value);
      }
      return converted;
    }

    return obj;
  }
}

module.exports = FirebaseService;
