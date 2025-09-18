const ProductComparisonService = require('../services/productComparisonService');
const ProductService = require('../services/productService');
const UserService = require('../services/userService');

const productComparisonService = new ProductComparisonService();
const productService = new ProductService();
const userService = new UserService();

// Get user's product comparison
exports.getUserComparison = async (req, res) => {
  try {
    let comparison = await productComparisonService.getOrCreateComparison(req.user.id);

    // Update last viewed
    await productComparisonService.update(comparison.id, {
      lastViewed: new Date()
    });

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

    const comparison = await productComparisonService.addProductToComparison(req.user.id, productId);

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

    const comparison = await productComparisonService.removeProductFromComparison(req.user.id, productId);

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
    const comparison = await productComparisonService.clearComparison(req.user.id);

    res.json({
      message: 'Comparison cleared',
      comparison
    });

  } catch (error) {
    res.status(500).json({ message: 'Error clearing comparison', error: error.message });
  }
};

// Get comparison with product details
exports.getComparisonWithProducts = async (req, res) => {
  try {
    const comparison = await productComparisonService.getComparisonWithProducts(req.user.id);

    res.json({ comparison });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparison with products', error: error.message });
  }
};

// Check if product is in comparison
exports.checkProductInComparison = async (req, res) => {
  try {
    const { productId } = req.params;

    const isInComparison = await productComparisonService.isProductInComparison(req.user.id, productId);

    res.json({ isInComparison });

  } catch (error) {
    res.status(500).json({ message: 'Error checking product in comparison', error: error.message });
  }
};

// Get comparison count
exports.getComparisonCount = async (req, res) => {
  try {
    const count = await productComparisonService.getComparisonCount(req.user.id);

    res.json({ count });

  } catch (error) {
    res.status(500).json({ message: 'Error getting comparison count', error: error.message });
  }
};

// Get comparison statistics
exports.getComparisonStats = async (req, res) => {
  try {
    const stats = await productComparisonService.getComparisonStats(req.user.id);

    res.json(stats);

  } catch (error) {
    res.status(500).json({ message: 'Error getting comparison stats', error: error.message });
  }
};

// Get all comparisons (admin)
exports.getAllComparisons = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const comparisons = await productComparisonService.getAll({
      sortBy: 'lastViewed',
      sortOrder: 'desc',
      limitCount: parseInt(limit) * 10
    });

    // Apply pagination
    const total = comparisons.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedComparisons = comparisons.slice(startIndex, endIndex);

    res.json({
      comparisons: paginatedComparisons,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comparisons', error: error.message });
  }
};

// Get comparison by user (admin)
exports.getComparisonByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const comparison = await productComparisonService.getComparisonByUser(userId);

    res.json({ comparison });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching user comparison', error: error.message });
  }
};

// Delete comparison (admin)
exports.deleteComparison = async (req, res) => {
  try {
    const { id } = req.params;

    await productComparisonService.delete(id);

    res.json({ message: 'Comparison deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting comparison', error: error.message });
  }
}; 