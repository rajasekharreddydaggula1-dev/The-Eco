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
    await User.create({
      name: 'Eco Super Admin',
      email: 'admin@theeco.com',
      password: 'password123',
      role: 'Super Admin',
      status: 'active',
      walletBalance: 10000
    });
    console.log('Super Admin account created: admin@theeco.com / password123');

    // 2. Create Vendor 1 (Nike)
    const vendor1 = await User.create({
      name: 'John Nike',
      email: 'nike@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store1 = await Store.create({
      name: 'Nike Store',
      slug: 'nike',
      description: 'The official Nike Store. High performance sportswear with sustainable materials.',
      logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=150',
      banner: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&auto=format&fit=crop&q=80',
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
      status: 'active',
      walletBalance: 5000
    });

    const store2 = await Store.create({
      name: 'Eco Foods',
      slug: 'eco-foods',
      description: 'Your premium organic foods store. Direct from farm to table.',
      logo: 'https://images.unsplash.com/photo-1506306400032-ee15ef7d6e4d?w=150',
      banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor2._id,
      status: 'active'
    });

    vendor2.store = store2._id;
    await vendor2.save();
    console.log('Foods Vendor created: foods@theeco.com / password123 (slug: eco-foods)');

    // 4. Create Vendor 3 (Organic India)
    const vendor3 = await User.create({
      name: 'John Organic',
      email: 'organic@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store3 = await Store.create({
      name: 'Organic India',
      slug: 'organic-india',
      description: 'Authentic organic foods, herbal supplements, and wellness teas.',
      logo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150',
      banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor3._id,
      status: 'active'
    });

    vendor3.store = store3._id;
    await vendor3.save();
    console.log('Organic India Vendor created: organic@theeco.com / password123 (slug: organic-india)');

    // 5. Create Vendor 4 (Khadi Naturals)
    const vendor4 = await User.create({
      name: 'John Khadi',
      email: 'khadi@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store4 = await Store.create({
      name: 'Khadi Naturals',
      slug: 'khadi-naturals',
      description: '100% certified organic cotton apparel, yoga items, and handwoven garments.',
      logo: 'https://images.unsplash.com/photo-1582281229050-e25e14435864?w=150',
      banner: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor4._id,
      status: 'active'
    });

    vendor4.store = store4._id;
    await vendor4.save();
    console.log('Khadi Naturals Vendor created: khadi@theeco.com / password123 (slug: khadi-naturals)');

    // 6. Create Vendor 5 (Clay & Earth)
    const vendor5 = await User.create({
      name: 'John Clay',
      email: 'clay@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store5 = await Store.create({
      name: 'Clay & Earth',
      slug: 'clay-earth',
      description: 'Handcrafted terracotta, clay pots, and sustainable earthenware for your home.',
      logo: 'https://images.unsplash.com/photo-1565192647048-f997ded879ab?w=150',
      banner: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor5._id,
      status: 'active'
    });

    vendor5.store = store5._id;
    await vendor5.save();
    console.log('Clay & Earth Vendor created: clay@theeco.com / password123 (slug: clay-earth)');

    // === NEW STORES SEEDING ===

    // 7. Create Vendor 6 (Green Tech)
    const vendor6 = await User.create({
      name: 'Alex Tech',
      email: 'tech@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store6 = await Store.create({
      name: 'Green Tech',
      slug: 'green-tech',
      description: 'Premium eco-friendly gadgets, solar chargers, and biodegradable tech accessories.',
      logo: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=150',
      banner: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor6._id,
      status: 'active'
    });

    vendor6.store = store6._id;
    await vendor6.save();
    console.log('Green Tech Vendor created: tech@theeco.com / password123 (slug: green-tech)');

    // 8. Create Vendor 7 (Pure Bamboo)
    const vendor7 = await User.create({
      name: 'Bella Bamboo',
      email: 'bamboo@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store7 = await Store.create({
      name: 'Pure Bamboo',
      slug: 'pure-bamboo',
      description: 'Crafted bamboo furniture, kitchenware, toilet paper, and bio-degradable lifestyle products.',
      logo: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=150',
      banner: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor7._id,
      status: 'active'
    });

    vendor7.store = store7._id;
    await vendor7.save();
    console.log('Pure Bamboo Vendor created: bamboo@theeco.com / password123 (slug: pure-bamboo)');

    // 9. Create Vendor 8 (Herbal Garden)
    const vendor8 = await User.create({
      name: 'Emma Herbal',
      email: 'herbal@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store8 = await Store.create({
      name: 'Herbal Garden',
      slug: 'herbal-garden',
      description: 'Organic essential oils, natural skincare, and handmade soaps direct from nature.',
      logo: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=150',
      banner: 'https://images.unsplash.com/photo-1471017851983-fc49d89c59f2?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor8._id,
      status: 'active'
    });

    vendor8.store = store8._id;
    await vendor8.save();
    console.log('Herbal Garden Vendor created: herbal@theeco.com / password123 (slug: herbal-garden)');

    // 10. Create Customers
    const customer1 = await User.create({
      name: 'Alice Cooper',
      email: 'alice@theeco.com',
      password: 'password123',
      role: 'Customer',
      status: 'active',
      walletBalance: 5000
    });
    const customer2 = await User.create({
      name: 'Bob Marley',
      email: 'bob@theeco.com',
      password: 'password123',
      role: 'Customer',
      status: 'active',
      walletBalance: 7500
    });
    console.log('Customers created: alice@theeco.com (Wallet: ₹5000), bob@theeco.com (Wallet: ₹7500)');

    // === SEED PRODUCTS FOR STORES ===

    // Store 1: Nike Store Products
    const nikeProduct1 = await Product.create({
      store: store1._id,
      name: 'Air Max Runner 90',
      description: 'Iconic running shoes engineered with ultra-plush cushioning and responsive step rebound.',
      price: 9999,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'
      ],
      category: 'Footwear',
      stock: 45,
      variants: [
        { name: 'Size 9', price: 9999, stock: 15 },
        { name: 'Size 10', price: 9999, stock: 20 },
        { name: 'Size 11', price: 10999, stock: 10 }
      ]
    });

    const nikeProduct2 = await Product.create({
      store: store1._id,
      name: 'Dry-Fit Training Tee',
      description: 'Sweat-wicking athletic fit shirt ideal for intensive gym routines and jogging.',
      price: 1899,
      images: [
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'
      ],
      category: 'Apparel',
      stock: 60,
      variants: [
        { name: 'Small', price: 1899, stock: 20 },
        { name: 'Medium', price: 1899, stock: 25 },
        { name: 'Large', price: 1999, stock: 15 }
      ]
    });
    console.log('Nike products seeded.');

    // Store 2: Eco Foods Products
    const foodProduct1 = await Product.create({
      store: store2._id,
      name: 'Organic Honeycrisp Apples',
      description: 'Crisp, sweet, and locally harvested apples. Free of synthetic fertilizers.',
      price: 499,
      images: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600'
      ],
      category: 'Produce',
      stock: 100,
      variants: [
        { name: '1kg bag', price: 499, stock: 50 },
        { name: '3kg box', price: 1399, stock: 50 }
      ]
    });

    const foodProduct2 = await Product.create({
      store: store2._id,
      name: 'Cold Pressed Avocado Oil',
      description: '100% pure avocado oil perfect for high-heat cooking, roasting, or salad dressings.',
      price: 1250,
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'
      ],
      category: 'Pantry',
      stock: 40,
      variants: [
        { name: '250ml', price: 1250, stock: 20 },
        { name: '500ml', price: 2250, stock: 20 }
      ]
    });
    console.log('Eco Foods products seeded.');

    // Store 3: Organic India Products
    const organicProduct1 = await Product.create({
      store: store3._id,
      name: 'Organic Tulsi Green Tea',
      description: 'A refreshing combination of Tulsi and premium Green Tea. Abundant in phytonutrients and antioxidants.',
      price: 250,
      images: [
        'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600'
      ],
      category: 'Beverages',
      stock: 150,
      variants: [
        { name: '100g Pack', price: 250, stock: 80 },
        { name: '250g Pack', price: 550, stock: 70 }
      ]
    });

    const organicProduct2 = await Product.create({
      store: store3._id,
      name: 'Pure Cow Ghee',
      description: 'Traditional Vedic method cow ghee made from milk fat. Healthy, nutritious, and full of natural aroma.',
      price: 750,
      images: [
        'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600'
      ],
      category: 'Pantry',
      stock: 80,
      variants: [
        { name: '500ml Jar', price: 750, stock: 40 },
        { name: '1L Jar', price: 1400, stock: 40 }
      ]
    });

    const organicProduct3 = await Product.create({
      store: store3._id,
      name: 'Wild Forest Honey',
      description: '100% pure organic wild forest honey sourced from natural bee hives in deep forests.',
      price: 450,
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600'
      ],
      category: 'Pantry',
      stock: 90,
      variants: [
        { name: '250g Jar', price: 450, stock: 45 },
        { name: '500g Jar', price: 800, stock: 45 }
      ]
    });
    console.log('Organic India products seeded.');

    // Store 4: Khadi Naturals Products
    const khadiProduct1 = await Product.create({
      store: store4._id,
      name: 'Handwoven Khadi Shirt',
      description: 'Breathable, hand-spun, and handwoven cotton Khadi shirt. Classy traditional look.',
      price: 1499,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'
      ],
      category: 'Apparel',
      stock: 50,
      variants: [
        { name: 'Medium', price: 1499, stock: 25 },
        { name: 'Large', price: 1599, stock: 25 }
      ]
    });

    const khadiProduct2 = await Product.create({
      store: store4._id,
      name: 'Eco Yoga Mat',
      description: 'Made from bio-degradable natural tree rubber and cotton fibers. Slip-resistant and sweat-resistant.',
      price: 1299,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'
      ],
      category: 'Fitness',
      stock: 35,
      variants: [
        { name: 'Standard 6mm', price: 1299, stock: 35 }
      ]
    });

    const khadiProduct3 = await Product.create({
      store: store4._id,
      name: 'Organic Cotton Bed Sheet',
      description: 'Luxuriously soft double bed sheet made with 100% organic long-staple cotton fibers.',
      price: 1999,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'
      ],
      category: 'Home Decor',
      stock: 40,
      variants: [
        { name: 'Double Size', price: 1999, stock: 20 },
        { name: 'King Size', price: 2499, stock: 20 }
      ]
    });
    console.log('Khadi Naturals products seeded.');

    // Store 5: Clay & Earth Products
    const clayProduct1 = await Product.create({
      store: store5._id,
      name: 'Terracotta Water Jug',
      description: 'Traditional clay water jug that naturally cools drinking water through evaporation.',
      price: 650,
      images: [
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600'
      ],
      category: 'Earthenware',
      stock: 30,
      variants: [
        { name: 'Standard 1.5L', price: 650, stock: 30 }
      ]
    });

    const clayProduct2 = await Product.create({
      store: store5._id,
      name: 'Hand-painted Clay Cups (Set of 6)',
      description: 'Beautifully designed organic clay cups for tea (Chai) and coffee. Environmentally friendly.',
      price: 450,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'
      ],
      category: 'Earthenware',
      stock: 50,
      variants: [
        { name: 'Set of 6', price: 450, stock: 50 }
      ]
    });

    const clayProduct3 = await Product.create({
      store: store5._id,
      name: 'Ceramic Plant Pot',
      description: 'Elegant, eco-friendly ceramic pot for indoor and outdoor plants. Adds a splash of green style.',
      price: 890,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'
      ],
      category: 'Home Decor',
      stock: 60,
      variants: [
        { name: 'Small', price: 490, stock: 20 },
        { name: 'Medium', price: 890, stock: 20 },
        { name: 'Large', price: 1290, stock: 20 }
      ]
    });
    console.log('Clay & Earth products seeded.');

    // Store 6: Green Tech Products
    const techProduct1 = await Product.create({
      store: store6._id,
      name: 'Solar Power Bank',
      description: 'Rugged, water-resistant 20,000mAh backup battery charged by solar energy. Built-in LED flashlight.',
      price: 2499,
      images: [
        'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=600'
      ],
      category: 'Electronics',
      stock: 50,
      variants: [
        { name: 'Standard Edition', price: 2499, stock: 50 }
      ]
    });

    const techProduct2 = await Product.create({
      store: store6._id,
      name: 'Biodegradable Phone Case',
      description: '100% compostable and zero-waste protective case for iPhone and Android. Made from flax straw.',
      price: 899,
      images: [
        'https://images.unsplash.com/photo-1605335960017-d2e85ab55ec1?w=600'
      ],
      category: 'Accessories',
      stock: 120,
      variants: [
        { name: 'Matte Forest Green', price: 899, stock: 60 },
        { name: 'Matte Charcoal Black', price: 899, stock: 60 }
      ]
    });

    const techProduct3 = await Product.create({
      store: store6._id,
      name: 'Bamboo Bluetooth Speaker',
      description: 'Portable wireless speaker made from sustainable natural bamboo. Deep bass and crystal-clear sound.',
      price: 3299,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'
      ],
      category: 'Electronics',
      stock: 30,
      variants: [
        { name: 'Wood Finish', price: 3299, stock: 30 }
      ]
    });
    console.log('Green Tech products seeded.');

    // Store 7: Pure Bamboo Products
    const bambooProduct1 = await Product.create({
      store: store7._id,
      name: 'Bamboo Cutlery Set',
      description: 'Reusable organic bamboo fork, knife, spoon, and straw in a travel cotton pouch. Zero plastic.',
      price: 499,
      images: [
        'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600'
      ],
      category: 'Kitchenware',
      stock: 150,
      variants: [
        { name: 'Single Set', price: 499, stock: 100 },
        { name: 'Family Pack of 4', price: 1699, stock: 50 }
      ]
    });

    const bambooProduct2 = await Product.create({
      store: store7._id,
      name: 'Organic Bamboo Sheets',
      description: 'Luxuriously soft, cooling, and hypoallergenic bed sheets made from 100% bamboo viscose.',
      price: 2999,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'
      ],
      category: 'Bedding',
      stock: 40,
      variants: [
        { name: 'Queen Size', price: 2999, stock: 20 },
        { name: 'King Size', price: 3499, stock: 20 }
      ]
    });

    const bambooProduct3 = await Product.create({
      store: store7._id,
      name: 'Bamboo Toothbrushes (Pack of 4)',
      description: 'Biodegradable bamboo toothbrushes with charcoal-infused soft bristles. Clean teeth, clean oceans.',
      price: 299,
      images: [
        'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600'
      ],
      category: 'Personal Care',
      stock: 200,
      variants: [
        { name: 'Family Pack', price: 299, stock: 200 }
      ]
    });
    console.log('Pure Bamboo products seeded.');

    // Store 8: Herbal Garden Products
    const herbalProduct1 = await Product.create({
      store: store8._id,
      name: 'Lavender Essential Oil',
      description: '100% pure therapeutic grade lavender oil. Promotes relaxation, calm sleep, and skin soothing.',
      price: 599,
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'
      ],
      category: 'Wellness',
      stock: 75,
      variants: [
        { name: '10ml Bottle', price: 599, stock: 50 },
        { name: '30ml Bottle', price: 1299, stock: 25 }
      ]
    });

    const herbalProduct2 = await Product.create({
      store: store8._id,
      name: 'Charcoal Handmade Soap',
      description: 'Natural detoxifying soap bar made with activated charcoal and organic coconut oil. Unscented.',
      price: 199,
      images: [
        'https://images.unsplash.com/photo-1607006342411-9a336f7de18a?w=600'
      ],
      category: 'Skincare',
      stock: 100,
      variants: [
        { name: '100g Bar', price: 199, stock: 100 }
      ]
    });

    const herbalProduct3 = await Product.create({
      store: store8._id,
      name: 'Organic Aloe Vera Gel',
      description: '99% pure aloe vera gel directly extracted from plants. Soothes sunburn, hydrates hair and dry skin.',
      price: 349,
      images: [
        'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600'
      ],
      category: 'Skincare',
      stock: 80,
      variants: [
        { name: '150ml Tube', price: 349, stock: 80 }
      ]
    });
    console.log('Herbal Garden products seeded.');

    // 11. Seed initial orders (using INR prices)
    await Order.create({
      store: store1._id,
      customer: customer1._id,
      items: [{
        product: nikeProduct1._id,
        name: 'Air Max Runner 90',
        quantity: 1,
        price: 9999,
        variantName: 'Size 10'
      }],
      totalAmount: 9999,
      status: 'paid',
      stripeSessionId: 'mock_session_seed_order_1',
      shippingAddress: {
        street: '456 Oak Rd',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'IN'
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    });

    await Order.create({
      store: store1._id,
      customer: customer1._id,
      items: [{
        product: nikeProduct2._id,
        name: 'Dry-Fit Training Tee',
        quantity: 2,
        price: 1899,
        variantName: 'Medium'
      }],
      totalAmount: 3798,
      status: 'delivered',
      stripeSessionId: 'mock_session_seed_order_2',
      shippingAddress: {
        street: '456 Oak Rd',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'IN'
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    });

    // Add one order for organic store
    await Order.create({
      store: store3._id,
      customer: customer2._id,
      items: [{
        product: organicProduct1._id,
        name: 'Organic Tulsi Green Tea',
        quantity: 2,
        price: 250,
        variantName: '100g Pack'
      }, {
        product: organicProduct2._id,
        name: 'Pure Cow Ghee',
        quantity: 1,
        price: 750,
        variantName: '500ml Jar'
      }],
      totalAmount: 1250,
      status: 'paid',
      stripeSessionId: 'mock_session_seed_order_3',
      shippingAddress: {
        street: '789 Lotus Blvd',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN'
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
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
