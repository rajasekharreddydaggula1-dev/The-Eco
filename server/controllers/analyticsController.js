const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');

// @desc    Get dashboard analytics metrics
// @route   GET /api/analytics
// @access  Private (Vendor/Admin)
exports.getAnalytics = async (req, res) => {
  try {
    if (req.user.role === 'Vendor') {
      const storeId = req.headers['x-tenant-id'] || req.user.store;
      if (!storeId) {
        return res.status(400).json({ success: false, message: 'Vendor has no store registered.' });
      }

      // Verify ownership
      const store = await Store.findById(storeId);
      if (!store || store.vendor.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized for this store' });
      }

      // 1. Total revenue
      const revenueData = await Order.aggregate([
        { $match: { store: storeId, status: { $in: ['paid', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const totalRevenue = revenueData[0] ? revenueData[0].total : 0;

      // 2. Total orders count
      const totalOrders = await Order.countDocuments({ store: storeId });

      // 3. Products count
      const totalProducts = await Product.countDocuments({ store: storeId });

      // 4. Sales by month (for Recharts)
      const monthlySales = await Order.aggregate([
        { $match: { store: storeId, status: { $in: ['paid', 'shipped', 'delivered'] } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            ordersCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 6 }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const chartData = monthlySales.map(item => ({
        name: `${months[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
        orders: item.ordersCount
      }));

      // If chartData is empty, pre-populate with mock data so it renders beautifully immediately
      const formattedChartData = chartData.length > 0 ? chartData : [
        { name: 'Jan', revenue: 0, orders: 0 },
        { name: 'Feb', revenue: 0, orders: 0 },
        { name: 'Mar', revenue: 0, orders: 0 },
        { name: 'Apr', revenue: 0, orders: 0 },
        { name: 'May', revenue: 0, orders: 0 },
        { name: 'Jun', revenue: 0, orders: 0 }
      ];

      // 5. Popular products
      const popularProducts = await Order.aggregate([
        { $match: { store: storeId } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            sold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { sold: -1 } },
        { $limit: 5 }
      ]);

      return res.status(200).json({
        success: true,
        role: 'Vendor',
        metrics: {
          totalRevenue,
          totalOrders,
          totalProducts
        },
        chartData: formattedChartData,
        popularProducts
      });

    } else if (req.user.role === 'Super Admin') {
      // Platform wide analytics
      const totalStores = await Store.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'Customer' });
      const totalVendors = await User.countDocuments({ role: 'Vendor' });

      // Total platform revenue
      const platformRevenueData = await Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const platformRevenue = platformRevenueData[0] ? platformRevenueData[0].total : 0;

      // Stores registration growth
      const monthlyStores = await Store.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const storeGrowthData = monthlyStores.map(item => ({
        name: `${months[item._id.month - 1]} ${item._id.year}`,
        stores: item.count
      }));

      return res.status(200).json({
        success: true,
        role: 'Super Admin',
        metrics: {
          totalStores,
          totalUsers,
          totalCustomers,
          totalVendors,
          platformRevenue
        },
        chartData: storeGrowthData.length > 0 ? storeGrowthData : [{ name: 'June', stores: totalStores }]
      });
    }

    res.status(403).json({ success: false, message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
