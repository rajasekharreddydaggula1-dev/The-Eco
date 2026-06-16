const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/the_eco');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Store.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Existing collections cleared.');

    // 1. Create Super Admin
    const superAdmin = await User.create({
      name: 'Eco Super Admin',
      email: 'admin@theeco.com',
      password: 'password123',
      role: 'Super Admin',
      status: 'active'
    });
    console.log('Super Admin account created: admin@theeco.com / password123');

    // 2. Create Vendor 1 (Nike)
    const vendor1 = await User.create({
      name: 'John Nike',
      email: 'nike@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active'
    });

    const store1 = await Store.create({
      name: 'Nike Store',
      slug: 'nike',
      description: 'The official Nike Store. Just Do It.',
      logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
      banner: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor1._id,
      status: 'active'
    });

    vendor1.store = store1._id;
    await vendor1.save();
    console.log('Nike Vendor created: nike@theeco.com / password123 (slug: nike)');

    // 3. Create Vendor 2 (Eco Foods)
    const vendor2 = await User.create({
      name: 'Jane Foods',
      email: 'foods@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active'
    });

    const store2 = await Store.create({
      name: 'Eco Foods',
      slug: 'eco-foods',
      description: 'Your premium organic foods store. Direct from farm to table.',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
      banner: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor2._id,
      status: 'active'
    });

    vendor2.store = store2._id;
    await vendor2.save();
    console.log('Foods Vendor created: foods@theeco.com / password123 (slug: eco-foods)');

    // 4. Create Customers
    const customer1 = await User.create({
      name: 'Alice Cooper',
      email: 'alice@theeco.com',
      password: 'password123',
      role: 'Customer',
      status: 'active'
    });
    console.log('Customer created: alice@theeco.com / password123');

    // 5. Seed Products for Nike Store
    const nikeProduct1 = await Product.create({
      store: store1._id,
      name: 'Air Max Runner 90',
      description: 'Iconic running shoes engineered with ultra-plush cushioning and responsive step rebound.',
      price: 120,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'
      ],
      category: 'Footwear',
      stock: 45,
      variants: [
        { name: 'Size 9', price: 120, stock: 15 },
        { name: 'Size 10', price: 120, stock: 20 },
        { name: 'Size 11', price: 130, stock: 10 }
      ]
    });

    const nikeProduct2 = await Product.create({
      store: store1._id,
      name: 'Dry-Fit Training Tee',
      description: 'Sweat-wicking athletic fit shirt ideal for intensive gym routines and jogging.',
      price: 35,
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'
      ],
      category: 'Apparel',
      stock: 60,
      variants: [
        { name: 'Small', price: 35, stock: 20 },
        { name: 'Medium', price: 35, stock: 25 },
        { name: 'Large', price: 38, stock: 15 }
      ]
    });
    console.log('Nike products seeded.');

    // 6. Seed Products for Eco Foods
    const foodProduct1 = await Product.create({
      store: store2._id,
      name: 'Organic Honeycrisp Apples',
      description: 'Crisp, sweet, and locally harvested apples. Free of synthetic fertilizers.',
      price: 5.99,
      images: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600'
      ],
      category: 'Produce',
      stock: 100,
      variants: [
        { name: '1kg bag', price: 5.99, stock: 50 },
        { name: '3kg box', price: 15.99, stock: 50 }
      ]
    });

    const foodProduct2 = await Product.create({
      store: store2._id,
      name: 'Cold Pressed Avocado Oil',
      description: '100% pure avocado oil perfect for high-heat cooking, roasting, or salad dressings.',
      price: 14.50,
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'
      ],
      category: 'Pantry',
      stock: 40,
      variants: [
        { name: '250ml', price: 14.50, stock: 20 },
        { name: '500ml', price: 24.50, stock: 20 }
      ]
    });
    console.log('Eco Foods products seeded.');

    // 7. Seed initial order for Nike (Alice purchased 1 Air Max size 10)
    await Order.create({
      store: store1._id,
      customer: customer1._id,
      items: [{
        product: nikeProduct1._id,
        name: 'Air Max Runner 90',
        quantity: 1,
        price: 120,
        variantName: 'Size 10'
      }],
      totalAmount: 120,
      status: 'paid',
      stripeSessionId: 'mock_session_seed_order_1',
      shippingAddress: {
        street: '456 Oak Rd',
        city: 'Metropolis',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    });

    // Seed another order for Nike (2 days ago)
    await Order.create({
      store: store1._id,
      customer: customer1._id,
      items: [{
        product: nikeProduct2._id,
        name: 'Dry-Fit Training Tee',
        quantity: 2,
        price: 35,
        variantName: 'Medium'
      }],
      totalAmount: 70,
      status: 'delivered',
      stripeSessionId: 'mock_session_seed_order_2',
      shippingAddress: {
        street: '456 Oak Rd',
        city: 'Metropolis',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });

    console.log('Sample orders seeded.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
