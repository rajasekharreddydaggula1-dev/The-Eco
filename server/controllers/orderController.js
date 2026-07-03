const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
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
    const { items, shippingAddress, paymentMethod, paymentDetails } = req.body;

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
          currency: 'inr',
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

    const chosenMethod = paymentMethod || 'Stripe';
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock_key';
    const isOnlinePayment = ['Stripe', 'Card', 'UPI', 'Net Banking'].includes(chosenMethod);

    if (isStripeConfigured && isOnlinePayment) {
      order.paymentMethod = 'Stripe';
      await order.save();

      // Create real Stripe checkout session (Stripe dynamically lists payment methods based on your Stripe account)
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

      return res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    }

    // Otherwise, handle Wallet, COD, or Mock Fallback for online payments
    order.paymentMethod = chosenMethod;

    if (chosenMethod === 'Wallet') {
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        await Order.findByIdAndDelete(order._id);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (user.walletBalance < totalAmount) {
        await Order.findByIdAndDelete(order._id);
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }
      user.walletBalance -= totalAmount;
      await user.save();

      const mockSessionId = `mock_wallet_${Date.now()}_${order._id}`;
      order.stripeSessionId = mockSessionId;
      order.status = 'paid';
      order.paymentDetails = { transactionId: `WT-${Date.now()}` };
      await order.save();

      await deductStock(order.items);

      return res.status(200).json({
        success: true,
        mock: true,
        url: `/checkout-success?session_id=${mockSessionId}&payment_method=Wallet`
      });
    }

    if (chosenMethod === 'COD') {
      const mockSessionId = `mock_cod_${Date.now()}_${order._id}`;
      order.stripeSessionId = mockSessionId;
      order.status = 'pending';
      order.paymentDetails = { codCollected: false };
      await order.save();

      await deductStock(order.items);

      return res.status(200).json({
        success: true,
        mock: true,
        url: `/checkout-success?session_id=${mockSessionId}&payment_method=COD`
      });
    }

    // Fallback Mock Mode for Card, UPI, Net Banking, or Stripe when Stripe is not configured
    const mockSessionId = `mock_${chosenMethod.toLowerCase().replace(' ', '_')}_${Date.now()}_${order._id}`;
    order.stripeSessionId = mockSessionId;
    order.status = 'paid';
    order.paymentDetails = paymentDetails || {};
    await order.save();

    await deductStock(order.items);

    return res.status(200).json({
      success: true,
      mock: true,
      sessionId: mockSessionId,
      url: `/checkout-success?session_id=${mockSessionId}&payment_method=${encodeURIComponent(chosenMethod)}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm Payment (both Mock and real Stripe checkout/wallet recharge)
// @route   POST /api/orders/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { sessionId, type } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    // 1. Handle Mock payment session
    if (sessionId.startsWith('mock_')) {
      if (type === 'wallet' || sessionId.includes('wallet_recharge')) {
        return res.status(200).json({
          success: true,
          message: 'Mock wallet recharge verified successfully',
          walletBalance: req.user.walletBalance
        });
      }

      const order = await Order.findOne({ stripeSessionId: sessionId });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found for session' });
      }

      if (order.status === 'pending') {
        order.status = 'paid';
        await order.save();
        await deductStock(order.items);
        console.log(`[MOCK EMAIL] To: ${req.user.email} - Order ${order._id} paid successfully via Mock Payment.`);
      }

      return res.status(200).json({ success: true, message: 'Mock payment verified successfully', order });
    }

    // 2. Handle Real Stripe session
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock_key';
    if (!isStripeConfigured) {
      return res.status(400).json({ success: false, message: 'Stripe is not configured on this server' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Stripe session not found' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment has not been completed' });
    }

    const isWalletRecharge = type === 'wallet' || (session.metadata && session.metadata.type === 'wallet_recharge');

    if (isWalletRecharge) {
      const userId = session.metadata ? session.metadata.userId : req.user.id;
      const amount = session.metadata ? Number(session.metadata.amount) : (session.amount_total / 100);

      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check if session has already been processed to avoid double crediting
      if (!user.processedStripeSessions.includes(sessionId)) {
        user.walletBalance = (user.walletBalance || 0) + amount;
        user.processedStripeSessions.push(sessionId);
        await user.save();
        console.log(`[EMAIL LOGGER] To: ${user.email} - Wallet topped up by ₹${amount} successfully. New Balance: ₹${user.walletBalance}`);
      } else {
        console.log(`[Payment Confirmation] Wallet recharge session ${sessionId} already processed.`);
      }

      return res.status(200).json({
        success: true,
        message: 'Stripe wallet recharge verified successfully',
        walletBalance: user.walletBalance
      });
    } else {
      // Order Checkout
      const order = await Order.findOne({ stripeSessionId: sessionId });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found for session' });
      }

      if (order.status === 'pending') {
        order.status = 'paid';
        await order.save();
        await deductStock(order.items);

        // Fetch customer email
        const user = await User.findById(order.customer);
        const customerEmail = user ? user.email : 'customer@theeco.com';
        console.log(`[EMAIL LOGGER] To: ${customerEmail} - Order ${order._id} marked as Paid. Thank you!`);
      }

      return res.status(200).json({ success: true, message: 'Payment verified successfully', order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep confirmMockPayment for backward compatibility but delegate to confirmPayment
exports.confirmMockPayment = async (req, res) => {
  return exports.confirmPayment(req, res);
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
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Check if it's a wallet recharge or standard order checkout
    if (session.metadata && session.metadata.type === 'wallet_recharge') {
      const { userId, amount } = session.metadata;
      try {
        const user = await User.findById(userId).select('+password');

        if (user) {
          if (!user.processedStripeSessions.includes(session.id)) {
            user.walletBalance = (user.walletBalance || 0) + Number(amount);
            user.processedStripeSessions.push(session.id);
            await user.save();
            console.log(`[EMAIL LOGGER] To: ${user.email} - Wallet topped up by ₹${amount} successfully. New Balance: ₹${user.walletBalance}`);
          } else {
            console.log(`[Webhook] Wallet recharge session ${session.id} already processed.`);
          }
        } else {
          console.error(`[Webhook] User ${userId} not found for wallet recharge.`);
        }
      } catch (dbErr) {
        console.error(`Failed to update wallet balance on webhook: ${dbErr.message}`);
        return res.status(500).json({ success: false, message: `Database error: ${dbErr.message}` });
      }
    } else {
      const orderId = session.metadata ? session.metadata.orderId : null;
      if (orderId) {
        try {
          const order = await Order.findById(orderId);
          if (order && order.status === 'pending') {
            order.status = 'paid';
            await order.save();

            // Adjust stock
            await deductStock(order.items);

            // Fetch customer email
            const user = await User.findById(order.customer);
            const customerEmail = user ? user.email : 'customer@theeco.com';
            console.log(`[EMAIL LOGGER] To: ${customerEmail} - Order ${order._id} marked as Paid. Thank you!`);
          }
        } catch (dbErr) {
          console.error(`Failed to update order on webhook: ${dbErr.message}`);
          return res.status(500).json({ success: false, message: `Database error: ${dbErr.message}` });
        }
      }
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
    if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel customer order (refund if paid)
// @route   POST /api/orders/:id/cancel
// @access  Private (Customer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['shipped', 'delivered', 'cancelled', 'returned'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}` });
    }

    const previousStatus = order.status;
    order.status = 'cancelled';
    await order.save();

    // Refund if payment was completed
    if (previousStatus === 'paid') {
      req.user.walletBalance = (req.user.walletBalance || 0) + order.totalAmount;
      await req.user.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order cancelled successfully', 
      order,
      walletBalance: req.user.walletBalance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return customer order (refund)
// @route   POST /api/orders/:id/return
// @access  Private (Customer)
exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to return this order' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
    }

    order.status = 'returned';
    await order.save();

    // Refund the amount to the customer's wallet
    req.user.walletBalance = (req.user.walletBalance || 0) + order.totalAmount;
    await req.user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Order return requested and refunded successfully', 
      order,
      walletBalance: req.user.walletBalance 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
