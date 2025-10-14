const FirebaseService = require('./firebaseService');
const unifiedStore = require('./unifiedStore');
const ProductService = require('./productService');

class PackageService extends FirebaseService {
  constructor() {
    super('packages');
    this.cacheTTL = 300;
  }

  async getCacheKey(operation, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `packages:${operation}:${sortedParams}`;
  }

  async getFromCache(cacheKey) {
    try {
      return await unifiedStore.getCache(cacheKey);
    } catch (_) {
      return null;
    }
  }

  async setCache(cacheKey, data, ttl = this.cacheTTL) {
    try {
      await unifiedStore.setCache(cacheKey, data, ttl);
    } catch (_) {
      // noop
    }
  }

  async invalidateCache(pattern = 'packages:*') {
    try {
      await unifiedStore.clearCache(pattern);
    } catch (_) {
      // noop
    }
  }

  async createPackage(data) {
    const now = new Date();
    const payload = {
      name: data.name,
      description: data.description || '',
      image: data.image || '',
      items: Array.isArray(data.items) ? data.items : [], // [{ productId, quantity }]
      packagePrice: Number(data.packagePrice || 0),
      originalTotal: 0,
      discountPercentage: 0,
      isActive: data.isActive !== undefined ? !!data.isActive : true,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      createdAt: now,
      updatedAt: now
    };

    // Calculate totals from products
    const productService = new ProductService();
    if (payload.items.length > 0) {
      let sum = 0;
      for (const it of payload.items) {
        if (!it || !it.productId) continue;
        const p = await productService.getProductById(it.productId);
        const qty = Number(it.quantity || 1);
        if (p && typeof p.price === 'number') {
          sum += p.price * qty;
        }
      }
      payload.originalTotal = Number(sum.toFixed(2));
      if (payload.packagePrice > 0 && payload.originalTotal > 0) {
        payload.discountPercentage = Math.max(
          0,
          Math.min(100, Number(((1 - payload.packagePrice / payload.originalTotal) * 100).toFixed(2)))
        );
      }
    }

    const created = await this.create(payload);
    await this.invalidateCache();
    return created;
  }

  async updatePackage(id, data) {
    const patch = { ...data, updatedAt: new Date() };

    // If pricing-affecting fields changed, recompute
    const affectsTotals = data.items || data.packagePrice !== undefined;
    if (affectsTotals) {
      const productService = new ProductService();
      const items = Array.isArray(data.items) ? data.items : null;
      let originalTotal = 0;
      const current = await this.getById(id);
      const sourceItems = items || current?.items || [];
      for (const it of sourceItems) {
        if (!it || !it.productId) continue;
        const p = await productService.getProductById(it.productId);
        const qty = Number(it.quantity || 1);
        if (p && typeof p.price === 'number') {
          originalTotal += p.price * qty;
        }
      }
      patch.originalTotal = Number(originalTotal.toFixed(2));
      const pkgPrice = data.packagePrice !== undefined ? Number(data.packagePrice) : current?.packagePrice || 0;
      patch.discountPercentage = patch.originalTotal > 0 && pkgPrice > 0
        ? Math.max(0, Math.min(100, Number(((1 - pkgPrice / patch.originalTotal) * 100).toFixed(2))))
        : 0;
    }

    const updated = await this.update(id, patch);
    await this.invalidateCache();
    return updated;
  }

  async getPackages(options = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const cacheKey = await this.getCacheKey('getPackages', { page, limit, search, isActive, sortBy, sortOrder });
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    // Base fetch
    const filters = [];
    if (isActive !== undefined) {
      filters.push({ field: 'isActive', operator: '==', value: !!isActive });
    }
    const docs = await this.getAll({ filters, sortBy, sortOrder, limitCount: limit * 3 });

    // In-memory search
    let list = docs;
    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }

    // Pagination
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = list.slice(startIndex, endIndex);

    const result = {
      packages: paginated,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      hasNextPage: endIndex < total,
      hasPrevPage: page > 1
    };

    await this.setCache(cacheKey, result, this.cacheTTL);
    return result;
  }

  async deletePackage(id) {
    const ok = await this.delete(id);
    await this.invalidateCache();
    return ok;
  }
}

module.exports = PackageService;




