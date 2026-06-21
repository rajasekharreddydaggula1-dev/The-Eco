const Store = require('../models/Store');
const mongoose = require('mongoose');

exports.resolveTenant = async (req, res, next) => {
  let store = null;
  let sentTenant = false;

  // 1. Try to get from x-tenant-id header
  const tenantId = req.headers['x-tenant-id'];
  if (tenantId) {
    sentTenant = true;
    if (mongoose.isValidObjectId(tenantId)) {
      store = await Store.findById(tenantId);
    }
  }

  // 2. Try to get from x-tenant-slug header
  const tenantSlug = req.headers['x-tenant-slug'];
  if (tenantSlug) {
    sentTenant = true;
    if (!store) {
      store = await Store.findOne({ slug: tenantSlug });
    }
  }

  // 3. Try to get from query parameters
  const querySlug = req.query.slug || req.query.tenantSlug;
  if (!store && querySlug) {
    store = await Store.findOne({ slug: querySlug });
  }

  // 4. Try to get from request path/params (e.g. /api/store/:slug/products)
  const paramSlug = req.params.storeSlug || req.params.slug;
  if (!store && paramSlug && paramSlug !== 'auth' && paramSlug !== 'analytics' && !mongoose.isValidObjectId(paramSlug)) {
    store = await Store.findOne({ slug: paramSlug });
  }

  // Track if a tenant header was sent but not found
  if (sentTenant && !store) {
    req.tenantNotFound = true;
  }

  // If a store is resolved, inject it into req
  if (store) {
    if (store.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This storefront has been suspended by the platform administrator.'
      });
    }
    req.tenantId = store._id.toString();
    req.store = store;
  }

  next();
};

// Enforce that tenant must be resolved for this route
exports.requireTenant = (req, res, next) => {
  if (req.tenantNotFound) {
    return res.status(400).json({
      success: false,
      message: 'The selected store tenant was not found in the database. Please clear your shopping cart and try adding the item again.'
    });
  }
  if (!req.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Store tenant context is missing. Provide x-tenant-id or x-tenant-slug in headers.'
    });
  }
  next();
};
