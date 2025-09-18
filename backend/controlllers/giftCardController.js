const GiftCardService = require('../services/giftCardService');
const UserService = require('../services/userService');
const OrderService = require('../services/orderService');
const sendEmail = require('../utils/email');

const giftCardService = new GiftCardService();
const userService = new UserService();
const orderService = new OrderService();

// Create a new gift card
exports.createGiftCard = async (req, res) => {
  try {
    const {
      amount,
      type = 'digital',
      issuedToEmail,
      message,
      expiresAt
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Check if recipient exists if email provided
    let issuedTo = null;
    if (issuedToEmail) {
      issuedTo = await userService.getUserByEmail(issuedToEmail);
    }

    // Create gift card
    const giftCardData = {
      amount,
      balance: amount,
      type,
      issuedBy: req.user.id,
      issuedTo: issuedTo?.id,
      issuedToEmail,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: 'active',
      code: await giftCardService.generateUniqueCode(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const giftCard = await giftCardService.create(giftCardData);

    // Send email to recipient if email provided
    if (issuedToEmail) {
      await sendEmail({
        to: issuedToEmail,
        subject: 'You received a gift card!',
        template: 'gift-card-received',
        context: {
          amount: amount.toFixed(2),
          code: giftCard.code,
          message,
          expiresAt: expiresAt ? new Date(expiresAt).toLocaleDateString() : 'No expiration',
          year: new Date().getFullYear()
        }
      });
    }

    res.status(201).json({
      message: 'Gift card created successfully',
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        amount: giftCard.amount,
        balance: giftCard.balance,
        type: giftCard.type,
        status: giftCard.status,
        expiresAt: giftCard.expiresAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creating gift card', error: error.message });
  }
};

// Get gift card by code
exports.getGiftCardByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const giftCard = await giftCardService.getGiftCardByCode(code.toUpperCase());

    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Check if expired
    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      await giftCardService.update(giftCard.id, { status: 'expired' });
      giftCard.status = 'expired';
    }

    res.json({
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        amount: giftCard.amount,
        balance: giftCard.balance,
        type: giftCard.type,
        status: giftCard.status,
        expiresAt: giftCard.expiresAt,
        issuedToEmail: giftCard.issuedToEmail,
        message: giftCard.message
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift card', error: error.message });
  }
};

// Apply gift card to order
exports.applyGiftCard = async (req, res) => {
  try {
    const { code, orderId } = req.body;

    const giftCard = await giftCardService.getGiftCardByCode(code.toUpperCase());
    if (!giftCard) {
      return res.status(404).json({ message: 'Invalid gift card code' });
    }

    const order = await orderService.getById(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate gift card
    if (giftCard.status !== 'active') {
      return res.status(400).json({ message: 'Gift card is not active' });
    }

    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Gift card has expired' });
    }

    if (giftCard.balance <= 0) {
      return res.status(400).json({ message: 'Gift card has no balance' });
    }

    // Calculate discount amount
    const discountAmount = Math.min(giftCard.balance, order.total);
    const newBalance = giftCard.balance - discountAmount;

    // Update gift card balance
    await giftCardService.update(giftCard.id, {
      balance: newBalance,
      status: newBalance <= 0 ? 'used' : 'active'
    });

    // Update order
    const updatedOrder = await orderService.update(orderId, {
      giftCardDiscount: discountAmount,
      total: order.total - discountAmount
    });

    res.json({
      message: 'Gift card applied successfully',
      order: updatedOrder,
      discountAmount,
      remainingBalance: newBalance
    });

  } catch (error) {
    res.status(500).json({ message: 'Error applying gift card', error: error.message });
  }
};

// Get all gift cards (admin)
exports.getAllGiftCards = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const giftCards = await giftCardService.getAll({
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = giftCards.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedGiftCards = giftCards.slice(startIndex, endIndex);

    res.json({
      giftCards: paginatedGiftCards,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift cards', error: error.message });
  }
};

// Get single gift card
exports.getGiftCard = async (req, res) => {
  try {
    const giftCard = await giftCardService.getById(req.params.id);
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }
    res.json(giftCard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift card', error: error.message });
  }
};

// Update gift card
exports.updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const giftCard = await giftCardService.getById(id);
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    const updatedGiftCard = await giftCardService.update(id, updateData);
    res.json(updatedGiftCard);
  } catch (error) {
    res.status(500).json({ message: 'Error updating gift card', error: error.message });
  }
};

// Delete gift card
exports.deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const giftCard = await giftCardService.getById(id);
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    await giftCardService.delete(id);
    res.json({ message: 'Gift card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gift card', error: error.message });
  }
};

// Get gift card statistics
exports.getGiftCardStats = async (req, res) => {
  try {
    const stats = await giftCardService.getGiftCardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift card stats', error: error.message });
  }
};

// Generate unique gift card code
exports.generateGiftCardCode = async (req, res) => {
  try {
    const code = await giftCardService.generateUniqueCode();
    res.json({ code });
  } catch (error) {
    res.status(500).json({ message: 'Error generating gift card code', error: error.message });
  }
}; 