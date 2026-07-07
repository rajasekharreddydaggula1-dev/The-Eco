const express = require('express');
const router = express.Router();
const { register, login, getMe, rechargeWallet, getVendors } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/wallet/recharge', protect, rechargeWallet);
router.get('/vendors', protect, authorize('Super Admin'), getVendors);

module.exports = router;
