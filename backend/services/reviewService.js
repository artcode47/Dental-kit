const FirebaseService = require('./firebaseService');

class ReviewService extends FirebaseService {
  constructor() {
    super('reviews');
  }

  // Create a new review
  async createReview(reviewData) {
    try {
      const review = {
        ...reviewData,
        isApproved: false,
        isModerated: false,
        helpfulVotes: 0,
        totalVotes: 0,
        isFlagged: false,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(review);
    } catch (error) {
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  // Get all reviews with filtering, sorting, and pagination
  async getReviews(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        productId,
        userId,
        rating,
        isApproved,
        isFlagged,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let reviews = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        reviews.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply filters in memory
      if (productId) {
        reviews = reviews.filter(review => review.productId === productId);
      }
      if (userId) {
        reviews = reviews.filter(review => review.userId === userId);
      }
      if (rating) {
        reviews = reviews.filter(review => review.rating === parseInt(rating));
      }
      if (isApproved !== undefined) {
        reviews = reviews.filter(review => review.isApproved === isApproved);
      }
      if (isFlagged !== undefined) {
        reviews = reviews.filter(review => review.isFlagged === isFlagged);
      }

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        reviews = reviews.filter(review => 
          review.title?.toLowerCase().includes(searchLower) ||
          review.comment?.toLowerCase().includes(searchLower)
        );
      }

      // Sort in memory
      reviews.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Calculate pagination
      const total = reviews.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReviews = reviews.slice(startIndex, endIndex);

      return {
        reviews: paginatedReviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error getting reviews: ${error.message}`);
    }
  }

  // Get review by ID
  async getReviewById(id) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }
      return review;
    } catch (error) {
      throw new Error(`Error getting review: ${error.message}`);
    }
  }

  // Update review
  async updateReview(id, updateData) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      const updatedReview = await this.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedReview;
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  // Delete review
  async deleteReview(id) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      await this.delete(id);
      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

  // Approve review
  async approveReview(id, moderatorId) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      const updatedReview = await this.update(id, {
        isApproved: true,
        isModerated: true,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        updatedAt: new Date()
      });

      return updatedReview;
    } catch (error) {
      throw new Error(`Error approving review: ${error.message}`);
    }
  }

  // Reject review
  async rejectReview(id, moderatorId, moderationNotes = '') {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      const updatedReview = await this.update(id, {
        isApproved: false,
        isModerated: true,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        moderationNotes,
        updatedAt: new Date()
      });

      return updatedReview;
    } catch (error) {
      throw new Error(`Error rejecting review: ${error.message}`);
    }
  }

  // Flag review
  async flagReview(id, userId, reason) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      const flagData = {
        user: userId,
        reason,
        date: new Date()
      };

      const updatedFlags = review.flaggedBy || [];
      updatedFlags.push(flagData);

      const updatedReview = await this.update(id, {
        isFlagged: true,
        flagReason: reason,
        flaggedBy: updatedFlags,
        updatedAt: new Date()
      });

      return updatedReview;
    } catch (error) {
      throw new Error(`Error flagging review: ${error.message}`);
    }
  }

  // Unflag review
  async unflagReview(id) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      const updatedReview = await this.update(id, {
        isFlagged: false,
        flagReason: null,
        updatedAt: new Date()
      });

      return updatedReview;
    } catch (error) {
      throw new Error(`Error unflagging review: ${error.message}`);
    }
  }

  // Add helpful vote
  async addHelpfulVote(id, isHelpful = true) {
    try {
      const review = await this.getById(id);
      if (!review) {
        throw new Error('Review not found');
      }

      const updatedReview = await this.update(id, {
        helpfulVotes: review.helpfulVotes + (isHelpful ? 1 : 0),
        totalVotes: review.totalVotes + 1,
        updatedAt: new Date()
      });

      return updatedReview;
    } catch (error) {
      throw new Error(`Error adding helpful vote: ${error.message}`);
    }
  }

  // Get reviews by product
  async getReviewsByProduct(productId, options = {}) {
    try {
      return await this.getReviews({
        productId,
        isApproved: true,
        ...options
      });
    } catch (error) {
      throw new Error(`Error getting product reviews: ${error.message}`);
    }
  }

  // Get reviews by user
  async getReviewsByUser(userId, options = {}) {
    try {
      return await this.getReviews({
        userId,
        ...options
      });
    } catch (error) {
      throw new Error(`Error getting user reviews: ${error.message}`);
    }
  }

  // Search reviews
  async searchReviews(searchTerm, options = {}) {
    try {
      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let reviews = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        reviews.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply filters in memory
      reviews = reviews.filter(review => review.isApproved === true);
      
      const searchLower = searchTerm.toLowerCase();
      const filteredReviews = reviews.filter(review => 
        review.title?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower)
      );

      return filteredReviews;
    } catch (error) {
      throw new Error(`Error searching reviews: ${error.message}`);
    }
  }

  // Get review statistics
  async getReviewStats(productId = null) {
    try {
      // Use simple query without complex filtering to avoid index issues
      const querySnapshot = await this.collectionRef.get();
      let reviews = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const convertedData = this.convertTimestamps(data);
        reviews.push({
          id: doc.id,
          ...convertedData
        });
      });

      // Apply product filter in memory
      if (productId) {
        reviews = reviews.filter(review => review.productId === productId);
      }

      const stats = {
        total: reviews.length,
        approved: reviews.filter(r => r.isApproved).length,
        pending: reviews.filter(r => !r.isApproved && !r.isModerated).length,
        flagged: reviews.filter(r => r.isFlagged).length,
        averageRating: 0,
        ratingDistribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      };

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        stats.averageRating = totalRating / reviews.length;

        reviews.forEach(review => {
          if (stats.ratingDistribution[review.rating] !== undefined) {
            stats.ratingDistribution[review.rating]++;
          }
        });
      }

      return stats;
    } catch (error) {
      throw new Error(`Error getting review stats: ${error.message}`);
    }
  }

  // Bulk review operations
  async bulkReviewOperations(operation, reviewIds, data = {}) {
    try {
      if (!operation || !reviewIds || !Array.isArray(reviewIds)) {
        throw new Error('Operation and review IDs array are required');
      }

      const updates = reviewIds.map(id => ({ id, data: {} }));

      switch (operation) {
        case 'approve':
          updates.forEach(update => {
            update.data.isApproved = true;
            update.data.isModerated = true;
            update.data.moderatedAt = new Date();
            update.data.updatedAt = new Date();
          });
          break;
        case 'reject':
          updates.forEach(update => {
            update.data.isApproved = false;
            update.data.isModerated = true;
            update.data.moderatedAt = new Date();
            update.data.updatedAt = new Date();
          });
          break;
        case 'flag':
          updates.forEach(update => {
            update.data.isFlagged = true;
            update.data.updatedAt = new Date();
          });
          break;
        case 'unflag':
          updates.forEach(update => {
            update.data.isFlagged = false;
            update.data.flagReason = null;
            update.data.updatedAt = new Date();
          });
          break;
        case 'delete':
          await this.batchDelete(reviewIds);
          return { message: `Bulk operation '${operation}' completed successfully` };
        default:
          throw new Error('Invalid operation');
      }

      await this.batchUpdate(updates);
      return { message: `Bulk operation '${operation}' completed successfully` };
    } catch (error) {
      throw new Error(`Error performing bulk review operations: ${error.message}`);
    }
  }
}

module.exports = ReviewService;

