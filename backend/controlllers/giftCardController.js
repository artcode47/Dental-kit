const GiftCard = require('../models/GiftCard');
const User = require('../models/User');
const Order = require('../models/Order');
const sendEmail = require('../utils/email');

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
      issuedTo = await User.findOne({ email: issuedToEmail });
    }

    // Create gift card
    const giftCard = new GiftCard({
      amount,
      balance: amount,
      type,
      issuedBy: req.user._id,
      issuedTo: issuedTo?._id,
      issuedToEmail,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await giftCard.save();

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
        id: giftCard._id,
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

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() })
      .populate('issuedBy', 'firstName lastName email')
      .populate('issuedTo', 'firstName lastName email');

    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Check if expired
    if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
      giftCard.status = 'expired';
      await giftCard.save();
    }

    res.json({
      giftCard: {
        id: giftCard._id,
        code: giftCard.code,
        amount: giftCard.amount,
        balance: giftCard.balance,
        type: giftCard.type,
        status: giftCard.status,
        issuedBy: giftCard.issuedBy,
        issuedTo: giftCard.issuedTo,
        issuedToEmail: giftCard.issuedToEmail,
        message: giftCard.message,
        expiresAt: giftCard.expiresAt,
        usedAt: giftCard.usedAt,
        createdAt: giftCard.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift card', error: error.message });
  }
};

// Use gift card
exports.useGiftCard = async (req, res) => {
  try {
    const { code, amount, orderId } = req.body;

    if (!code || !amount || !orderId) {
      return res.status(400).json({ message: 'Code, amount, and order ID are required' });
    }

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Use the gift card
    await giftCard.useCard(amount, orderId, req.user._id);

    res.json({
      message: 'Gift card used successfully',
      remainingBalance: giftCard.balance,
      status: giftCard.status
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user's gift cards
exports.getUserGiftCards = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};

    // Filter by issued by or issued to the user
    query.$or = [
      { issuedBy: req.user._id },
      { issuedTo: req.user._id },
      { issuedToEmail: req.user.email }
    ];

    if (status) query.status = status;
    if (type) query.type = type;

    const giftCards = await GiftCard.find(query)
      .populate('issuedBy', 'firstName lastName')
      .populate('issuedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ giftCards });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift cards', error: error.message });
  }
};

// Get gift card usage history
exports.getGiftCardHistory = async (req, res) => {
  try {
    const { giftCardId } = req.params;

    const giftCard = await GiftCard.findById(giftCardId)
      .populate('usageHistory.order', 'orderNumber total createdAt')
      .populate('issuedBy', 'firstName lastName')
      .populate('issuedTo', 'firstName lastName');

    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Check if user has access to this gift card
    const hasAccess = giftCard.issuedBy._id.toString() === req.user._id.toString() ||
                     giftCard.issuedTo?._id.toString() === req.user._id.toString() ||
                     giftCard.issuedToEmail === req.user.email;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ giftCard });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift card history', error: error.message });
  }
};

// Cancel gift card
exports.cancelGiftCard = async (req, res) => {
  try {
    const { giftCardId } = req.params;

    const giftCard = await GiftCard.findById(giftCardId);
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Only issuer can cancel
    if (giftCard.issuedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the issuer can cancel this gift card' });
    }

    if (giftCard.status !== 'active') {
      return res.status(400).json({ message: 'Gift card cannot be cancelled' });
    }

    giftCard.status = 'cancelled';
    await giftCard.save();

    res.json({ message: 'Gift card cancelled successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error cancelling gift card', error: error.message });
  }
};

// Admin: Get all gift cards
exports.getAllGiftCards = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      search
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { issuedToEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const giftCards = await GiftCard.find(query)
      .populate('issuedBy', 'firstName lastName email')
      .populate('issuedTo', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GiftCard.countDocuments(query);

    res.json({
      giftCards,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift cards', error: error.message });
  }
};

// Admin: Get gift card statistics
exports.getGiftCardStats = async (req, res) => {
  try {
    const stats = await GiftCard.aggregate([
      {
        $group: {
          _id: null,
          totalIssued: { $sum: '$amount' },
          totalUsed: { $sum: { $subtract: ['$amount', '$balance'] } },
          totalActive: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$balance', 0] } },
          totalExpired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, '$balance', 0] } },
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          usedCount: { $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] } },
          expiredCount: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } }
        }
      }
    ]);

    const monthlyStats = await GiftCard.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          issued: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      overall: stats[0] || {
        totalIssued: 0,
        totalUsed: 0,
        totalActive: 0,
        totalExpired: 0,
        count: 0,
        activeCount: 0,
        usedCount: 0,
        expiredCount: 0
      },
      monthly: monthlyStats
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift card statistics', error: error.message });
  }
}; 