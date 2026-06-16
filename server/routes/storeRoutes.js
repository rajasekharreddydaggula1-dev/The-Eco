const express = require('express');
const router = express.Router();
const {
  getStores,
  getStoreBySlug,
  getStore,
  updateStore,
  toggleStoreStatus
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getStores);
router.get('/slug/:slug', getStoreBySlug);
router.get('/:id', getStore);

// Protected update routes
router.put('/:id', protect, updateStore);
router.put('/:id/status', protect, authorize('Super Admin'), toggleStoreStatus);

module.exports = router;
