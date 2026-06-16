const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

// Helper to deduct product stock
const deductStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Deduct from total stock
      product.stock = Math.max(0, product.stock - item.quantity);

      // Deduct from variant stock if applicable
      if (item.variantName) {
        const variant = product.variants.find(v => v.name === item.variantName);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
      }
      await product.save();
    }
  }
};

// @desc    Create Stripe Checkout Session and Pending Order
// @route   POST /api/orders/checkout
// @access  Private (Customer)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];
    const stripeLineItems = [];

    // Verify products, variants, and stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      // Enforce product belongs to current tenant
      if (product.store.toString() !== req.tenantId) {
        return res.status(400).json({ success: false, message: 'Products in cart must belong to the same store tenant' });
      }

      let price = product.price;
      let stock = product.stock;

      // Handle variant pricing/stock
      if (item.variantName) {
        const variant = product.variants.find(v => v.name === item.variantName);
        if (!variant) {
          return res.status(400).json({ success: false, message: `Variant ${item.variantName} not found on product ${product.name}` });
        }
        price = variant.price;
        stock = variant.stock;
      }

      if (stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} (${item.variantName || 'Standard'})` });
      }

      totalAmount += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price,
        variantName: item.variantName || ''
      });

      // Prepare Stripe line items (Stripe expects amount in cents/subunit)
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} ${item.variantName ? `(${item.variantName})` : ''}`,
            description: product.description.substring(0, 100)
          },
          unit_amount: Math.round(price * 100)
        },
        quantity: item.quantity
      });
    }

    // Create the pending order in database
    const order = await Order.create({
      store: req.tenantId,
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      shippingAddress: shippingAddress || {
        street: '123 Main St',
        city: 'Sample City',
        state: 'CA',
        postalCode: '90001',
        country: 'US'
      }
    });

    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock_key';

    if (!isStripeConfigured) {
      // Mock payment mode if Stripe is not configured
      const mockSessionId = `mock_session_${Date.now()}_${order._id}`;
      order.stripeSessionId = mockSessionId;
      await order.save();

      return res.status(200).json({
        success: true,
        mock: true,
        sessionId: mockSessionId,
        url: `/checkout-success?session_id=${mockSessionId}`
      });
    }

    // Create real Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        storeId: req.tenantId
      }
    });

    // Save Stripe session ID to order
    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mock Confirm Payment (for local developer fallback)
// @route   POST /api/orders/confirm-mock-payment
// @access  Private
exports.confirmMockPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for session' });
    }

    if (order.status === 'pending') {
      order.status = 'paid';
      await order.save();

      // Deduct stock levels
      await deductStock(order.items);

      console.log(`[MOCK EMAIL] To: ${req.user.email} - Order ${order._id} paid successfully via Mock Payment.`);
    }

    res.status(200).json({ success: true, message: 'Mock payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Stripe Webhook Handler
// @route   POST /api/orders/webhook
// @access  Public (Stripe calls this)
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (webhookSecret) {
      // In production/stripe-cli local forwarding, verify signatures
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // If secret not configured, just grab body directly
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      const order = await Order.findById(orderId);
      if (order && order.status === 'pending') {
        order.status = 'paid';
        await order.save();

        // Adjust stock
        await deductStock(order.items);

        // Fetch customer email
        const user = await Product.model('User').findById(order.customer);
        const customerEmail = user ? user.email : 'customer@theeco.com';
        console.log(`[EMAIL LOGGER] To: ${customerEmail} - Order ${order._id} marked as Paid. Thank you!`);
      }
    } catch (dbErr) {
      console.error(`Failed to update order on webhook: ${dbErr.message}`);
      return res.status(500).send(`Database error: ${dbErr.message}`);
    }
  }

  res.json({ received: true });
};

// @desc    Get orders (Scoped by role)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Customer') {
      // Customers see their own orders
      query.customer = req.user.id;
    } else if (req.user.role === 'Vendor') {
      // Vendors see orders belonging to their store
      query.store = req.user.store;
    } else if (req.user.role === 'Super Admin') {
      // Super Admins see all orders on the platform
      query = {};
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('store', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Vendor can only update orders from their store
    if (req.user.role === 'Vendor' && order.store.toString() !== req.user.store.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this order' });
    }

    const { status } = req.body;
    if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
