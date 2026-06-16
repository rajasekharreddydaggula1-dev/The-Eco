const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a variant name (e.g. Size, Color)']
  },
  price: {
    type: Number,
    required: [true, 'Please add variant price']
  },
  stock: {
    type: Number,
    required: [true, 'Please add variant stock'],
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: [true, 'A product must belong to a store tenant'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  stock: {
    type: Number,
    required: [true, 'Please add total stock quantity'],
    default: 0
  },
  variants: [variantSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
