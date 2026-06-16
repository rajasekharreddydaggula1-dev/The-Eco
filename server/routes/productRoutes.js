const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { resolveTenant, requireTenant } = require('../middleware/tenant');

// All product routes require resolving the tenant context
router.use(resolveTenant);
router.use(requireTenant);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('Vendor'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('Vendor'), updateProduct)
  .delete(protect, authorize('Vendor'), deleteProduct);

module.exports = router;
