const Store = require('../models/Store');
const User = require('../models/User');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public (Optional admin view details)
exports.getStores = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show active stores
    if (!req.user || req.user.role !== 'Super Admin') {
      query.status = 'active';
    }

    const stores = await Store.find(query).populate('vendor', 'name email');
    res.status(200).json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single store by slug
// @route   GET /api/stores/slug/:slug
// @access  Public
exports.getStoreBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug }).populate('vendor', 'name email');
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('vendor', 'name email');
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update store metadata
// @route   PUT /api/stores/:id
// @access  Private (Vendor/Admin)
exports.updateStore = async (req, res) => {
  try {
    let store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Verify ownership or admin role
    if (store.vendor.toString() !== req.user.id && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this store' });
    }

    const { name, description, logo, banner } = req.body;
    
    if (name) {
      store.name = name;
      store.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) store.description = description;
    if (logo !== undefined) store.logo = logo;
    if (banner !== undefined) store.banner = banner;

    await store.save();

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle store status (Suspend / Approve)
// @route   PUT /api/stores/:id/status
// @access  Private (Super Admin)
exports.toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    store.status = status;
    await store.save();

    // Suspend or activate associated vendor user as well
    const vendor = await User.findById(store.vendor).select('+password');
    if (vendor) {
      vendor.status = status;
      await vendor.save();
    }

    res.status(200).json({ success: true, message: `Store and vendor status updated to ${status}`, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
