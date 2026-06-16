const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Vendor', 'Super Admin'), getAnalytics);

module.exports = router;
