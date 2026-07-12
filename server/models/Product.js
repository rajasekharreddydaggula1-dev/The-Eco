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
  ecoScore: {
    type: Number,
    default: () => Math.floor(Math.random() * 33) + 65 // 65-97
  },
  carbonOffset: {
    type: Number,
    default: () => Math.round((Math.random() * 3.4 + 0.8) * 10) / 10 // 0.8 - 4.2 kg CO2 saved
  },
  ecoFeatures: {
    type: [String],
    default: function() {
      const features = [
        "Organic Sourced",
        "Cruelty-Free Certified",
        "Carbon-Neutral Production",
        "Zero-Waste Packaging",
        "Biodegradable Materials",
        "Fair Trade Sourced",
        "Water-Saving Manufacturing"
      ];
      const shuffled = [...features].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
