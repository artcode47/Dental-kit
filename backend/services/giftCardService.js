const FirebaseService = require('./firebaseService');

class GiftCardService extends FirebaseService {
  constructor() {
    super('giftCards');
  }

  // Create a new gift card
  async createGiftCard(giftCardData) {
    try {
      const giftCard = {
        ...giftCardData,
        isActive: true,
        isRedeemed: false,
        balance: giftCardData.amount || giftCardData.balance,
        remainingBalance: giftCardData.amount || giftCardData.balance,
        usageHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.create(giftCard);
    } catch (error) {
      throw new Error(`Error creating gift card: ${error.message}`);
    }
  }

  // Get all gift cards with filtering, sorting, and pagination
  async getGiftCards(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        type,
        isActive,
        isRedeemed,
        minAmount,
        maxAmount,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      let filters = [];

      if (type) {
        filters.push({ field: 'type', operator: '==', value: type });
      }
      if (isActive !== undefined) {
        filters.push({ field: 'isActive', operator: '==', value: isActive });
      }
      if (isRedeemed !== undefined) {
        filters.push({ field: 'isRedeemed', operator: '==', value: isRedeemed });
      }

      const giftCards = await this.getAll({
        filters,
        sortBy,
        sortOrder,
        limitCount: limit
      });

      // Apply amount filters
      let filteredGiftCards = giftCards;
      if (minAmount !== undefined) {
        filteredGiftCards = filteredGiftCards.filter(card => 
          card.amount >= minAmount
        );
      }
      if (maxAmount !== undefined) {
        filteredGiftCards = filteredGiftCards.filter(card => 
          card.amount <= maxAmount
        );
      }

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        filteredGiftCards = filteredGiftCards.filter(card => 
          card.code.toLowerCase().includes(searchLower) ||
          card.recipientName?.toLowerCase().includes(searchLower) ||
          card.recipientEmail?.toLowerCase().includes(searchLower) ||
          card.senderName?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = filteredGiftCards.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGiftCards = filteredGiftCards.slice(startIndex, endIndex);

      return {
        giftCards: paginatedGiftCards,
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
      throw new Error(`Error getting gift cards: ${error.message}`);
    }
  }

  // Get gift card by ID
  async getGiftCardById(id) {
    try {
      const giftCard = await this.getById(id);
      if (!giftCard) {
        throw new Error('Gift card not found');
      }
      return giftCard;
    } catch (error) {
      throw new Error(`Error getting gift card: ${error.message}`);
    }
  }

  // Get gift card by code
  async getGiftCardByCode(code) {
    try {
      return await this.findOneBy('code', code.toUpperCase());
    } catch (error) {
      throw new Error(`Error getting gift card by code: ${error.message}`);
    }
  }

  // Update gift card
  async updateGiftCard(id, updateData) {
    try {
      const giftCard = await this.getById(id);
      if (!giftCard) {
        throw new Error('Gift card not found');
      }

      const updatedGiftCard = await this.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      return updatedGiftCard;
    } catch (error) {
      throw new Error(`Error updating gift card: ${error.message}`);
    }
  }

  // Delete gift card
  async deleteGiftCard(id) {
    try {
      const giftCard = await this.getById(id);
      if (!giftCard) {
        throw new Error('Gift card not found');
      }

      await this.delete(id);
      return { message: 'Gift card deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting gift card: ${error.message}`);
    }
  }

  // Validate gift card
  async validateGiftCard(code) {
    try {
      const giftCard = await this.getGiftCardByCode(code);
      if (!giftCard) {
        return { valid: false, message: 'Gift card not found' };
      }

      if (!giftCard.isActive) {
        return { valid: false, message: 'Gift card is inactive' };
      }

      if (giftCard.isRedeemed) {
        return { valid: false, message: 'Gift card has already been redeemed' };
      }

      const now = new Date();
      if (giftCard.expiryDate && now > new Date(giftCard.expiryDate)) {
        return { valid: false, message: 'Gift card has expired' };
      }

      if (giftCard.remainingBalance <= 0) {
        return { valid: false, message: 'Gift card has no remaining balance' };
      }

      return {
        valid: true,
        giftCard,
        message: 'Gift card is valid'
      };
    } catch (error) {
      throw new Error(`Error validating gift card: ${error.message}`);
    }
  }

  // Redeem gift card
  async redeemGiftCard(code, userId, orderId, amount) {
    try {
      const validation = await this.validateGiftCard(code);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const giftCard = validation.giftCard;

      if (amount > giftCard.remainingBalance) {
        throw new Error('Insufficient gift card balance');
      }

      // Update gift card
      const newBalance = giftCard.remainingBalance - amount;
      const isRedeemed = newBalance <= 0;

      const usageRecord = {
        orderId,
        userId,
        amount,
        redeemedAt: new Date()
      };

      const updatedGiftCard = await this.update(giftCard.id, {
        remainingBalance: newBalance,
        isRedeemed,
        usageHistory: [...(giftCard.usageHistory || []), usageRecord],
        updatedAt: new Date()
      });

      return {
        success: true,
        giftCard: updatedGiftCard,
        amountUsed: amount,
        remainingBalance: newBalance,
        message: 'Gift card redeemed successfully'
      };
    } catch (error) {
      throw new Error(`Error redeeming gift card: ${error.message}`);
    }
  }

  // Get gift cards by user
  async getGiftCardsByUser(userId, options = {}) {
    try {
      return await this.getGiftCards({
        userId,
        ...options
      });
    } catch (error) {
      throw new Error(`Error getting user gift cards: ${error.message}`);
    }
  }

  // Get gift cards by recipient
  async getGiftCardsByRecipient(recipientEmail, options = {}) {
    try {
      const giftCards = await this.getAll({
        filters: [{ field: 'recipientEmail', operator: '==', value: recipientEmail }],
        ...options
      });

      return giftCards;
    } catch (error) {
      throw new Error(`Error getting recipient gift cards: ${error.message}`);
    }
  }

  // Search gift cards
  async searchGiftCards(searchTerm, options = {}) {
    try {
      const giftCards = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });
      
      const searchLower = searchTerm.toLowerCase();
      const filteredGiftCards = giftCards.filter(card => 
        card.code.toLowerCase().includes(searchLower) ||
        card.recipientName?.toLowerCase().includes(searchLower) ||
        card.recipientEmail?.toLowerCase().includes(searchLower) ||
        card.senderName?.toLowerCase().includes(searchLower)
      );

      return filteredGiftCards;
    } catch (error) {
      throw new Error(`Error searching gift cards: ${error.message}`);
    }
  }

  // Get active gift cards
  async getActiveGiftCards(options = {}) {
    try {
      const giftCards = await this.getAll({
        filters: [
          { field: 'isActive', operator: '==', value: true },
          { field: 'isRedeemed', operator: '==', value: false }
        ],
        ...options
      });

      // Filter by expiry date
      const now = new Date();
      const activeGiftCards = giftCards.filter(card => {
        if (!card.expiryDate) return true;
        return now <= new Date(card.expiryDate);
      });

      return activeGiftCards;
    } catch (error) {
      throw new Error(`Error getting active gift cards: ${error.message}`);
    }
  }

  // Get expired gift cards
  async getExpiredGiftCards(options = {}) {
    try {
      const giftCards = await this.getAll({
        filters: [{ field: 'isActive', operator: '==', value: true }],
        ...options
      });

      const now = new Date();
      const expiredGiftCards = giftCards.filter(card => {
        if (!card.expiryDate) return false;
        return now > new Date(card.expiryDate);
      });

      return expiredGiftCards;
    } catch (error) {
      throw new Error(`Error getting expired gift cards: ${error.message}`);
    }
  }

  // Get gift card statistics
  async getGiftCardStats() {
    try {
      const giftCards = await this.getAll();

      const stats = {
        total: giftCards.length,
        active: giftCards.filter(c => c.isActive).length,
        inactive: giftCards.filter(c => !c.isActive).length,
        redeemed: giftCards.filter(c => c.isRedeemed).length,
        unredeemed: giftCards.filter(c => !c.isRedeemed).length,
        expired: 0,
        totalValue: 0,
        totalRedeemedValue: 0,
        totalRemainingValue: 0,
        byType: {
          digital: 0,
          physical: 0
        }
      };

      const now = new Date();
      giftCards.forEach(card => {
        if (card.expiryDate && new Date(card.expiryDate) < now) {
          stats.expired++;
        }
        stats.totalValue += card.amount || 0;
        stats.totalRedeemedValue += (card.amount || 0) - (card.remainingBalance || 0);
        stats.totalRemainingValue += card.remainingBalance || 0;
        if (stats.byType[card.type] !== undefined) {
          stats.byType[card.type]++;
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Error getting gift card stats: ${error.message}`);
    }
  }

  // Generate gift card code
  generateGiftCardCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        code += '-';
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Bulk gift card operations
  async bulkGiftCardOperations(operation, giftCardIds, data = {}) {
    try {
      if (!operation || !giftCardIds || !Array.isArray(giftCardIds)) {
        throw new Error('Operation and gift card IDs array are required');
      }

      const updates = giftCardIds.map(id => ({ id, data: {} }));

      switch (operation) {
        case 'activate':
          updates.forEach(update => {
            update.data.isActive = true;
            update.data.updatedAt = new Date();
          });
          break;
        case 'deactivate':
          updates.forEach(update => {
            update.data.isActive = false;
            update.data.updatedAt = new Date();
          });
          break;
        case 'markRedeemed':
          updates.forEach(update => {
            update.data.isRedeemed = true;
            update.data.remainingBalance = 0;
            update.data.updatedAt = new Date();
          });
          break;
        case 'update':
          updates.forEach(update => {
            update.data = { ...data, updatedAt: new Date() };
          });
          break;
        case 'delete':
          await this.batchDelete(giftCardIds);
          return { message: `Bulk operation '${operation}' completed successfully` };
        default:
          throw new Error('Invalid operation');
      }

      await this.batchUpdate(updates);
      return { message: `Bulk operation '${operation}' completed successfully` };
    } catch (error) {
      throw new Error(`Error performing bulk gift card operations: ${error.message}`);
    }
  }
}

module.exports = GiftCardService;

