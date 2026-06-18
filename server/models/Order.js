const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  variantName: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: [true, 'Order must belong to a store tenant'],
    index: true
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a customer']
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Stripe', 'Wallet', 'UPI', 'Card', 'Net Banking', 'COD'],
    default: 'Stripe'
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
