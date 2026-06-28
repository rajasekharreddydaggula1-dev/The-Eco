const User = require('../models/User');
const Store = require('../models/Store');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, storeName, storeDescription } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Determine default status
    const status = 'active';

    // If Vendor, check if store name is provided
    if (role === 'Vendor' && !storeName) {
      return res.status(400).json({ success: false, message: 'Store name is required for Vendor registration' });
    }

    // Create user
    let user = await User.create({
      name,
      email,
      password,
      role: role || 'Customer',
      status
    });

    // If role is Vendor, create the Store
    if (role === 'Vendor') {
      // Create slug from name
      const slug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check if slug or name exists
      const storeExists = await Store.findOne({ $or: [{ name: storeName }, { slug }] });
      if (storeExists) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'Store name is already taken' });
      }

      const store = await Store.create({
        name: storeName,
        slug,
        description: storeDescription || '',
        vendor: user._id,
        status: 'active'
      });

      // Update user with store ID
      user.store = store._id;
      await user.save();
    }

    // Refresh user object and sign token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
        status: user.status,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    console.log(`[AUTH] Login attempt for email: "${email}"`);

    // Check for user (case insensitive / lowercase search)
    const searchEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: searchEmail }).select('+password');
    if (!user) {
      console.log(`[AUTH] User not found for email: "${searchEmail}"`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`[AUTH] User found. Status: ${user.status}, Role: ${user.role}`);

    // Check status
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log(`[AUTH] Password verification result: ${isMatch}`);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If vendor, resolve store info to return to frontend
    let storeDetails = null;
    if (user.role === 'Vendor' && user.store) {
      storeDetails = await Store.findById(user.store);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store,
        status: user.status,
        walletBalance: user.walletBalance,
        storeDetails
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('store');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Recharge User Wallet
// @route   POST /api/auth/wallet/recharge
// @access  Private
exports.rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid recharge amount' });
    }

    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock_key';

    if (isStripeConfigured) {
      // Create Stripe Checkout Session for Wallet Top Up
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Wallet Top Up - The Eco',
                description: `Recharge wallet balance with ₹${amount}`
              },
              unit_amount: Math.round(amount * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&type=wallet`,
        cancel_url: `${req.headers.origin}/profile`,
        metadata: {
          type: 'wallet_recharge',
          userId: req.user.id,
          amount: amount.toString()
        }
      });

      return res.status(200).json({
        success: true,
        url: session.url
      });
    }

    // Fallback Mock Mode: directly update wallet balance in DB
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: Number(amount) } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `Successfully recharged ₹${amount}`,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
