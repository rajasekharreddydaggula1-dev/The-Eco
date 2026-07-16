const Product = require('../models/Product');

// @desc    Get products for a specific tenant store
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    // Enforce tenant scoping
    const query = { store: req.tenantId };

    // Search filter
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    const products = await Product.find(query);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Enforce tenant scoping
    if (product.store.toString() !== req.tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this product' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Vendor)
exports.createProduct = async (req, res) => {
  try {
    // Ensure vendor is editing their own store
    if (req.user.role === 'Vendor' && req.store.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only add products to your own store' });
    }

    const { name, description, price, images, category, stock, variants } = req.body;

    const product = await Product.create({
      store: req.tenantId,
      name,
      description,
      price,
      images: images || [],
      category,
      stock: stock || 0,
      variants: variants || []
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Vendor)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Enforce tenant scoping
    if (product.store.toString() !== req.tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this product' });
    }

    // Ensure vendor matches
    if (req.user.role === 'Vendor' && req.store.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this store\'s products' });
    }

    const { name, description, price, images, category, stock, variants } = req.body;

    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.images = images || product.images;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.variants = variants || product.variants;

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Enforce tenant scoping
    if (product.store.toString() !== req.tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    // Ensure vendor matches
    if (req.user.role === 'Vendor' && req.store.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this store\'s products' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
