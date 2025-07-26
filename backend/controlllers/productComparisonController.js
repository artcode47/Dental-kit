const ProductComparison = require('../models/ProductComparison');
const Product = require('../models/Product');
const User = require('../models/User');

// Get user's product comparison
exports.getUserComparison = async (req, res) => {
  try {
    let comparison = await ProductComparison.findOne({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name description price images brand averageRating totalReviews stock isOnSale salePercentage category vendor',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'vendor', select: 'name' }
        ]
      });

    if (!comparison) {
      // Create new comparison if doesn't exist
      comparison = new ProductComparison({ user: req.user._id });
      await comparison.save();
    }

    // Update last viewed
    await comparison.updateLastViewed();

    res.json({ comparison });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparison', error: error.message });
  }
};

// Add product to comparison
exports.addToComparison = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let comparison = await ProductComparison.findOne({ user: req.user._id });
    
    if (!comparison) {
      comparison = new ProductComparison({ user: req.user._id });
    }

    await comparison.addProduct(productId);

    // Populate product details
    await comparison.populate({
      path: 'products.product',
      select: 'name description price images brand averageRating totalReviews stock isOnSale salePercentage category vendor',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'vendor', select: 'name' }
      ]
    });

    res.json({
      message: 'Product added to comparison',
      comparison
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove product from comparison
exports.removeFromComparison = async (req, res) => {
  try {
    const { productId } = req.params;

    const comparison = await ProductComparison.findOne({ user: req.user._id });
    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    await comparison.removeProduct(productId);

    // Populate remaining products
    await comparison.populate({
      path: 'products.product',
      select: 'name description price images brand averageRating totalReviews stock isOnSale salePercentage category vendor',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'vendor', select: 'name' }
      ]
    });

    res.json({
      message: 'Product removed from comparison',
      comparison
    });

  } catch (error) {
    res.status(500).json({ message: 'Error removing product from comparison', error: error.message });
  }
};

// Clear comparison
exports.clearComparison = async (req, res) => {
  try {
    const comparison = await ProductComparison.findOne({ user: req.user._id });
    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    await comparison.clearProducts();

    res.json({
      message: 'Comparison cleared',
      comparison
    });

  } catch (error) {
    res.status(500).json({ message: 'Error clearing comparison', error: error.message });
  }
};

// Get comparison by share token (public)
exports.getPublicComparison = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const comparison = await ProductComparison.findOne({ 
      shareToken, 
      isPublic: true 
    })
    .populate({
      path: 'products.product',
      select: 'name description price images brand averageRating totalReviews stock isOnSale salePercentage category vendor',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'vendor', select: 'name' }
      ]
    })
    .populate('user', 'firstName lastName');

    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found or not public' });
    }

    // Update last viewed
    await comparison.updateLastViewed();

    res.json({ comparison });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparison', error: error.message });
  }
};

// Make comparison public/private
exports.togglePublic = async (req, res) => {
  try {
    const { isPublic, title, description } = req.body;

    const comparison = await ProductComparison.findOne({ user: req.user._id });
    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    comparison.isPublic = isPublic;
    if (title) comparison.title = title;
    if (description) comparison.description = description;

    await comparison.save();

    res.json({
      message: `Comparison ${isPublic ? 'made public' : 'made private'}`,
      comparison: {
        id: comparison._id,
        isPublic: comparison.isPublic,
        shareToken: comparison.shareToken,
        title: comparison.title,
        description: comparison.description
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error updating comparison visibility', error: error.message });
  }
};

// Get comparison statistics
exports.getComparisonStats = async (req, res) => {
  try {
    const stats = await ProductComparison.aggregate([
      {
        $group: {
          _id: null,
          totalComparisons: { $sum: 1 },
          publicComparisons: { $sum: { $cond: ['$isPublic', 1, 0] } },
          averageProductsPerComparison: { $avg: { $size: '$products' } },
          totalProductsCompared: { $sum: { $size: '$products' } }
        }
      }
    ]);

    const popularProducts = await ProductComparison.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          product: {
            _id: 1,
            name: 1,
            price: 1,
            images: 1,
            brand: 1
          },
          count: 1
        }
      }
    ]);

    res.json({
      overall: stats[0] || {
        totalComparisons: 0,
        publicComparisons: 0,
        averageProductsPerComparison: 0,
        totalProductsCompared: 0
      },
      popularProducts
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparison statistics', error: error.message });
  }
};

// Get comparison analytics for user
exports.getUserComparisonAnalytics = async (req, res) => {
  try {
    const comparison = await ProductComparison.findOne({ user: req.user._id });
    
    if (!comparison) {
      return res.json({
        totalProducts: 0,
        lastViewed: null,
        isPublic: false,
        shareToken: null
      });
    }

    const analytics = {
      totalProducts: comparison.products.length,
      lastViewed: comparison.lastViewed,
      isPublic: comparison.isPublic,
      shareToken: comparison.shareToken,
      title: comparison.title,
      description: comparison.description,
      createdAt: comparison.createdAt
    };

    res.json({ analytics });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparison analytics', error: error.message });
  }
};

// Admin: Get all comparisons
exports.getAllComparisons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isPublic,
      search
    } = req.query;

    const query = {};

    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const comparisons = await ProductComparison.find(query)
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'products.product',
        select: 'name price brand'
      })
      .sort({ lastViewed: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProductComparison.countDocuments(query);

    res.json({
      comparisons,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparisons', error: error.message });
  }
}; 