const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  confirmMockPayment,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { resolveTenant, requireTenant } = require('../middleware/tenant');

// Checkout requires Customer role and Tenant Store context
router.post('/checkout', protect, authorize('Customer'), resolveTenant, requireTenant, createCheckoutSession);

// Confirm mock payment for local development sandbox
router.post('/confirm-mock-payment', protect, confirmMockPayment);

// Get orders (scoped based on logged in user's role)
router.get('/', protect, getOrders);

// Update order status (Vendor/Admin)
router.put('/:id/status', protect, authorize('Vendor', 'Super Admin'), updateOrderStatus);

module.exports = router;
