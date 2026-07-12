const express = require('express');
const router = express.Router();
const {
  getStores,
  getStoreBySlug,
  getStore,
  createStore,
  updateStore,
  toggleStoreStatus,
  getEcoLeaderboard
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getStores);
router.get('/eco-leaderboard', getEcoLeaderboard);
router.get('/slug/:slug', getStoreBySlug);
router.get('/:id', getStore);

// Protected routes
router.post('/', protect, createStore);
router.put('/:id', protect, updateStore);
router.put('/:id/status', protect, authorize('Super Admin'), toggleStoreStatus);

module.exports = router;
