const { body, param, query } = require('express-validator');
const PackageService = require('../services/packageService');
const ProductService = require('../services/productService');

const packageService = new PackageService();
const productService = new ProductService();

exports.getPackages = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const result = await packageService.getPackages({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      sortBy,
      sortOrder
    });
    res.json(result);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ packages: [], total: 0, totalPages: 0, currentPage: 1 });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const pkg = await packageService.getById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching package' });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const created = await packageService.createPackage(req.body);
    res.status(201).json({ package: created });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ message: 'Error creating package' });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const updated = await packageService.updatePackage(req.params.id, req.body);
    res.json({ package: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating package' });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    await packageService.deletePackage(req.params.id);
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting package' });
  }
};

// Combined endpoint: active packages + discounted products
exports.getPackagesAndDiscounts = async (req, res) => {
  try {
    const { limitPackages = 12, limitProducts = 12 } = req.query;
    const [packagesResult, allProducts] = await Promise.all([
      packageService.getPackages({ page: 1, limit: parseInt(limitPackages), isActive: true, sortBy: 'createdAt', sortOrder: 'desc' }),
      productService.getAllSimple({ limitCount: 1000 })
    ]);

    const now = new Date();
    const activePackages = (packagesResult.packages || []).filter(p => {
      const startsOk = !p.startsAt || new Date(p.startsAt) <= now;
      const endsOk = !p.endsAt || new Date(p.endsAt) >= now;
      return p.isActive && startsOk && endsOk;
    });

    // Discounted products heuristic: flag `isOnSale` or price fields discount
    const discountedProducts = (allProducts || [])
      .filter(p => p.isActive && (p.isOnSale || (typeof p.price === 'number' && typeof p.compareAtPrice === 'number' && p.compareAtPrice > p.price)))
      .sort((a, b) => {
        const aPct = a.compareAtPrice && a.price ? (1 - a.price / a.compareAtPrice) : (a.salePercentage || 0) / 100;
        const bPct = b.compareAtPrice && b.price ? (1 - b.price / b.compareAtPrice) : (b.salePercentage || 0) / 100;
        return bPct - aPct;
      })
      .slice(0, parseInt(limitProducts));

    res.json({ packages: activePackages, discountedProducts });
  } catch (error) {
    console.error('Get packages and discounts error:', error);
    res.status(200).json({ packages: [], discountedProducts: [] });
  }
};




