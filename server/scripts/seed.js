const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database using robust local fallback logic
    await connectDB();
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
      logo: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=150', // Verified working Unsplash ID
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
      logo: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=150', // Verified working Unsplash ID
      banner: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor5._id,
      status: 'active'
    });

    vendor5.store = store5._id;
    await vendor5.save();
    console.log('Clay & Earth Vendor created: clay@theeco.com / password123 (slug: clay-earth)');

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

    // 10. Create Vendor 9 (The Green Wardrobe - Sustainable Fashion)
    const vendor9 = await User.create({
      name: 'Olivia Green',
      email: 'fashion@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store9 = await Store.create({
      name: 'The Green Wardrobe',
      slug: 'green-wardrobe',
      description: 'Eco-friendly apparel crafted from organic cotton, hemp, and recycled materials.',
      logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150',
      banner: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor9._id,
      status: 'active'
    });

    vendor9.store = store9._id;
    await vendor9.save();
    console.log('The Green Wardrobe Vendor created: fashion@theeco.com / password123 (slug: green-wardrobe)');

    // 11. Create Vendor 10 (Eco Home Decor - Handcrafted Furniture)
    const vendor10 = await User.create({
      name: 'Daniel Wood',
      email: 'home@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store10 = await Store.create({
      name: 'Eco Home Decor',
      slug: 'eco-home',
      description: 'Stunning home furnishings handcrafted from reclaimed wood, jute, and coconut shells.',
      logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150',
      banner: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor10._id,
      status: 'active'
    });

    vendor10.store = store10._id;
    await vendor10.save();
    console.log('Eco Home Decor Vendor created: home@theeco.com / password123 (slug: eco-home)');

    // 11a. Create Vendor 11 (Eco Stationery)
    const vendor11 = await User.create({
      name: 'John Stationery',
      email: 'stationery@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store11 = await Store.create({
      name: 'Eco Stationery',
      slug: 'eco-stationery',
      description: 'Premium notebooks, journals, and writing tools crafted from recycled paper, bamboo, and cork.',
      logo: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=150',
      banner: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor11._id,
      status: 'active'
    });

    vendor11.store = store11._id;
    await vendor11.save();
    console.log('Eco Stationery Vendor created: stationery@theeco.com / password123 (slug: eco-stationery)');

    // 11b. Create Vendor 12 (Solar Mobility)
    const vendor12 = await User.create({
      name: 'John Mobility',
      email: 'mobility@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store12 = await Store.create({
      name: 'Solar Mobility',
      slug: 'solar-mobility',
      description: 'Innovative solar-powered electric bikes, helmets, and green transit gear for the eco-conscious commuter.',
      logo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=150',
      banner: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor12._id,
      status: 'active'
    });

    vendor12.store = store12._id;
    await vendor12.save();
    console.log('Solar Mobility Vendor created: mobility@theeco.com / password123 (slug: solar-mobility)');

    // 11c. Create Vendor 13 (EcoClean Solutions)
    const vendor13 = await User.create({
      name: 'Jane Clean',
      email: 'clean@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store13 = await Store.create({
      name: 'EcoClean Solutions',
      slug: 'eco-clean',
      description: 'Refillable, non-toxic, and planet-friendly cleaning products for a sparkling clean home.',
      logo: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=150',
      banner: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor13._id,
      status: 'active'
    });

    vendor13.store = store13._id;
    await vendor13.save();
    console.log('EcoClean Solutions Vendor created: clean@theeco.com / password123 (slug: eco-clean)');

    // 11d. Create Vendor 14 (Thrift & Thread)
    const vendor14 = await User.create({
      name: 'Sarah Vintage',
      email: 'vintage@theeco.com',
      password: 'password123',
      role: 'Vendor',
      status: 'active',
      walletBalance: 5000
    });

    const store14 = await Store.create({
      name: 'Thrift & Thread',
      slug: 'thrift-thread',
      description: 'Curated vintage clothing and upcycled fashion to reduce textile waste and support circularity.',
      logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=150',
      banner: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80',
      vendor: vendor14._id,
      status: 'active'
    });

    vendor14.store = store14._id;
    await vendor14.save();
    console.log('Thrift & Thread Vendor created: vintage@theeco.com / password123 (slug: thrift-thread)');

    // 12. Create Customers
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


    // === DEFINE 20 DETAILED PRODUCTS FOR EACH OF THE 10 STORES ===

    const productPools = {
  "nike": [
    {
      "name": "Air Max Runner 90",
      "description": "Iconic running shoes engineered with ultra-plush cushioning and responsive step rebound.",
      "price": 9999,
      "category": "Footwear",
      "images": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
      ],
      "variants": [
        {
          "name": "Size 9",
          "price": 9999,
          "stock": 15
        },
        {
          "name": "Size 10",
          "price": 9999,
          "stock": 20
        },
        {
          "name": "Size 11",
          "price": 10999,
          "stock": 10
        }
      ]
    },
    {
      "name": "Dry-Fit Training Tee",
      "description": "Sweat-wicking athletic fit shirt ideal for intensive gym routines and jogging.",
      "price": 1899,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600"
      ],
      "variants": [
        {
          "name": "Small",
          "price": 1899,
          "stock": 20
        },
        {
          "name": "Medium",
          "price": 1899,
          "stock": 25
        },
        {
          "name": "Large",
          "price": 1999,
          "stock": 15
        }
      ]
    },
    {
      "name": "Sportswear Windrunner Jacket",
      "description": "Classic lightweight windbreaker built with 100% recycled polyester fibers. Water-repellent.",
      "price": 5499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600"
      ],
      "variants": [
        {
          "name": "M",
          "price": 5499,
          "stock": 15
        },
        {
          "name": "L",
          "price": 5499,
          "stock": 15
        }
      ]
    },
    {
      "name": "Utility Gym Duffel Bag",
      "description": "Durable and spacious duffel bag made from recycled materials, with dedicated shoe compartments.",
      "price": 2999,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
      ],
      "variants": [
        {
          "name": "Standard Black",
          "price": 2999,
          "stock": 40
        }
      ]
    },
    {
      "name": "Pegasus Trail Runner",
      "description": "Eco-conscious offroad running shoes with recycled mesh panels and high-grip rubber soles.",
      "price": 11999,
      "category": "Footwear",
      "images": [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"
      ]
    },
    {
      "name": "Move Organic Cotton Hoodie",
      "description": "Cozy everyday hoodie woven from organic cotton and recycled fleece lining.",
      "price": 4499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600"
      ]
    },
    {
      "name": "Dry-Fit Gym Shorts",
      "description": "Ultra-lightweight and breathable training shorts crafted from recycled ocean ocean plastics.",
      "price": 1699,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600"
      ]
    },
    {
      "name": "Recycled Rubber Basketball",
      "description": "Premium grip indoor/outdoor basketball composed of 60% recycled rubber materials.",
      "price": 2199,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600"
      ]
    },
    {
      "name": "Stability Run Sock (Pack of 3)",
      "description": "Arch-support socks spun with post-consumer recycled nylon fibers. Odor resistant.",
      "price": 999,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600"
      ]
    },
    {
      "name": "Vapor Next-Gen Running Cap",
      "description": "High-ventilation running cap with sweat-absorbent lining made of recycled polyester.",
      "price": 1299,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"
      ]
    },
    {
      "name": "Court Classic Sneakers",
      "description": "Retro design court sneakers updated with sustainable faux-leather uppers.",
      "price": 5999,
      "category": "Footwear",
      "images": [
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600"
      ]
    },
    {
      "name": "Therma-FIT Tech Joggers",
      "description": "Thermal retention athletic pants made from recycled materials. Elastic waist.",
      "price": 3499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1515438084819-7ce3a8147e1?w=600"
      ]
    },
    {
      "name": "Next-Nature Sports Bra",
      "description": "Compression athletic fit sports bra constructed with 75% recycled polyester yarn.",
      "price": 2299,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600"
      ]
    },
    {
      "name": "Eco Hydro Flask (750ml)",
      "description": "Stainless steel vacuum-insulated water bottle finished in durable matte powder coating.",
      "price": 1999,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
      ]
    },
    {
      "name": "Recycled Fiber Yoga Block",
      "description": "High density, non-slip yoga block constructed from recycled EVA foam materials.",
      "price": 799,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=600"
      ]
    },
    {
      "name": "SuperRep HIIT Training Shoes",
      "description": "Engineered for energy return during explosive circuit workouts. Recycled sole.",
      "price": 8999,
      "category": "Footwear",
      "images": [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600"
      ]
    },
    {
      "name": "Elite Gym Lifting Gloves",
      "description": "Comfortable padded palms made from vegan microsuede leather and recycled fabric mesh.",
      "price": 1499,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600"
      ]
    },
    {
      "name": "Storm Runner Rain Pants",
      "description": "Seam-sealed water-resistant training trousers. Zippers at hems for easy on/off.",
      "price": 3999,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600"
      ]
    },
    {
      "name": "Nike Shield Winter Running Jacket",
      "description": "Weatherproof outer shell with fleece lining to protect against sub-zero temperatures.",
      "price": 8499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
      ]
    },
    {
      "name": "Zoom Fly Athletic Spikes",
      "description": "Ultra-lightweight track spike shoes with carbon-composite sole plate for top speed.",
      "price": 7499,
      "category": "Footwear",
      "images": [
        "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600"
      ]
    }
  ],
  "organic-india": [
    {
      "name": "Organic Tulsi Green Tea",
      "description": "A refreshing combination of Tulsi and premium Green Tea. Abundant in phytonutrients and antioxidants.",
      "price": 250,
      "category": "Beverages",
      "images": [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
      ],
      "variants": [
        {
          "name": "100g Pack",
          "price": 250,
          "stock": 80
        },
        {
          "name": "250g Pack",
          "price": 550,
          "stock": 70
        }
      ]
    },
    {
      "name": "Pure Cow Ghee",
      "description": "Traditional Vedic method cow ghee made from milk fat. Healthy, nutritious, and full of natural aroma.",
      "price": 750,
      "category": "Pantry",
      "images": [
        "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600"
      ],
      "variants": [
        {
          "name": "500ml Jar",
          "price": 750,
          "stock": 40
        },
        {
          "name": "1L Jar",
          "price": 1400,
          "stock": 40
        }
      ]
    },
    {
      "name": "Wild Forest Honey",
      "description": "100% pure organic wild forest honey sourced from natural bee hives in deep forests.",
      "price": 450,
      "category": "Pantry",
      "images": [
        "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600"
      ],
      "variants": [
        {
          "name": "250g Jar",
          "price": 450,
          "stock": 45
        },
        {
          "name": "500g Jar",
          "price": 800,
          "stock": 45
        }
      ]
    },
    {
      "name": "Organic Ashwagandha",
      "description": "60 vegetarian capsules of pure organic Ashwagandha root powder. Helps combat stress and fatigue.",
      "price": 399,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ],
      "variants": [
        {
          "name": "60 Capsules",
          "price": 399,
          "stock": 110
        }
      ]
    },
    {
      "name": "Tulsi Ginger Tea (25 Bags)",
      "description": "Zesty ginger meets adaptive Tulsi in this classic, soothing wellness tea blend.",
      "price": 220,
      "category": "Beverages",
      "images": [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
      ]
    },
    {
      "name": "Organic Triphala Powder",
      "description": "Traditional Ayurvedic formula for digestive rejuvenation and colon cleanse.",
      "price": 249,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600"
      ]
    },
    {
      "name": "Moringa Hibiscus Green Tea",
      "description": "Antioxidant-rich organic moringa leaf blended with tart hibiscus and green tea.",
      "price": 260,
      "category": "Beverages",
      "images": [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
      ]
    },
    {
      "name": "Organic Shatavari Capsules",
      "description": "Traditional Ayurvedic herb for female reproductive health and hormonal balance.",
      "price": 375,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    },
    {
      "name": "Turmeric Formula Capsules",
      "description": "Contains organic turmeric and ginger. Supports healthy joint function and mobility.",
      "price": 399,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    },
    {
      "name": "Amalaki Vitamin C Capsules",
      "description": "Wild harvested amla fruit. Natural source of bioavailable Vitamin C for immunity.",
      "price": 350,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    },
    {
      "name": "Tulsi Sweet Lemon Tea",
      "description": "A bright, citrusy Tulsi blend with a hint of natural sweet stevia leaves.",
      "price": 220,
      "category": "Beverages",
      "images": [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
      ]
    },
    {
      "name": "Neem Skin Wellness Capsules",
      "description": "Purified organic neem leaf powder. Detoxifies blood and supports clear, glowing skin.",
      "price": 350,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    },
    {
      "name": "Organic Psyllium Husk (Isabgol)",
      "description": "100% organic soluble dietary fiber for optimal gut transit and health.",
      "price": 280,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600"
      ]
    },
    {
      "name": "Tulsi Peppermint Tea",
      "description": "Crisp peppermint combined with three varieties of Tulsi leaves. Energizing.",
      "price": 230,
      "category": "Beverages",
      "images": [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
      ]
    },
    {
      "name": "Brahmi Mental Fitness Capsules",
      "description": "Certified organic Gotu Kola (Brahmi). Enhances memory, focus, and cognitive function.",
      "price": 375,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    },
    {
      "name": "Organic Wheat Grass Powder",
      "description": "Dehydrated organic wheatgrass juice powder. Excellent daily green superfood drink.",
      "price": 450,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600"
      ]
    },
    {
      "name": "Coconut Palm Sugar Organic",
      "description": "Unrefined low-glycemic brown sweetener evaporated from organic coconut palm sap.",
      "price": 320,
      "category": "Pantry",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Bowel Care Herbal Capsules",
      "description": "Ayurvedic blend of Bael leaf and psyllium. Regulates bowel movements naturally.",
      "price": 399,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    },
    {
      "name": "Tulsi Honey Chamomile Tea",
      "description": "Relaxing chamomile blossoms infused with sweet honey aroma and soothing Tulsi.",
      "price": 250,
      "category": "Beverages",
      "images": [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600"
      ]
    },
    {
      "name": "Vitality Energy Capsules",
      "description": "Powerhouse blend of Ashwagandha, Katuki, and Rama Tulsi. Enhances endurance.",
      "price": 450,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600"
      ]
    }
  ],
  "khadi-naturals": [
    {
      "name": "Handwoven Khadi Shirt",
      "description": "Breathable, hand-spun, and handwoven cotton Khadi shirt. Classy traditional look.",
      "price": 1499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
      ],
      "variants": [
        {
          "name": "Medium",
          "price": 1499,
          "stock": 25
        },
        {
          "name": "Large",
          "price": 1599,
          "stock": 25
        }
      ]
    },
    {
      "name": "Eco Yoga Mat",
      "description": "Made from bio-degradable natural tree rubber and cotton fibers. Slip-resistant and sweat-resistant.",
      "price": 1299,
      "category": "Fitness",
      "images": [
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600"
      ],
      "variants": [
        {
          "name": "Standard 6mm",
          "price": 1299,
          "stock": 35
        }
      ]
    },
    {
      "name": "Organic Cotton Bed Sheet",
      "description": "Luxuriously soft double bed sheet made with 100% organic long-staple cotton fibers.",
      "price": 1999,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"
      ],
      "variants": [
        {
          "name": "Double Size",
          "price": 1999,
          "stock": 20
        },
        {
          "name": "King Size",
          "price": 2499,
          "stock": 20
        }
      ]
    },
    {
      "name": "Herbal Neem & Teatree Face Wash",
      "description": "Refreshing face wash infused with pure neem and tea tree oil extracts. Cleanses and purifies skin naturally.",
      "price": 249,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"
      ],
      "variants": [
        {
          "name": "150ml Bottle",
          "price": 249,
          "stock": 95
        }
      ]
    },
    {
      "name": "Khadi Jasmine Hair Oil",
      "description": "Nourishing herbal hair oil formulated with pure jasmine extract and cold pressed sesame base.",
      "price": 299,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Shikakai Herbal Shampoo",
      "description": "Gentle clarifying shampoo containing soapnut (Reetha) and Shikakai. Promotes hair growth.",
      "price": 320,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"
      ]
    },
    {
      "name": "Rose & Honey Body Wash",
      "description": "Luxurious moisturizing shower gel scented with pure Damask rose oil and organic honey.",
      "price": 280,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600"
      ]
    },
    {
      "name": "Sandalwood Soap Bar (Pack of 3)",
      "description": "Triple-milled cold process soap bars enriched with pure Mysore sandalwood oil.",
      "price": 350,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1607006342411-9a336f7de18a?w=600"
      ]
    },
    {
      "name": "Saffron Anti-Aging Cream",
      "description": "Lightweight night moisturizer infused with pure saffron strands and almond oil.",
      "price": 499,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600"
      ]
    },
    {
      "name": "Handspun Khadi Kurta",
      "description": "Traditional unisex long tunic shirt. Beautiful rustic weave in raw beige tone.",
      "price": 1299,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
      ]
    },
    {
      "name": "Organic Cotton Bath Towel",
      "description": "High-absorbency, zero-twist organic cotton towel. Soft on skin and fast drying.",
      "price": 699,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600"
      ]
    },
    {
      "name": "Aloe Vera Moisturizing Lotion",
      "description": "Quick-absorbing body lotion composed of 90% organic aloe leaf juice and shea butter.",
      "price": 249,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"
      ]
    },
    {
      "name": "Handspun Khadi Scarf",
      "description": "Soft, lightweight summer wrap handwoven with cotton and mulberry silk blend threads.",
      "price": 499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
      ]
    },
    {
      "name": "Coconut Herbal Hair Mask",
      "description": "Deep conditioning treatment enriched with coconut milk, henna, and rosemary.",
      "price": 399,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"
      ]
    },
    {
      "name": "Khadi Lavender Essential Oil",
      "description": "100% pure therapeutic grade essential oil steam-distilled from lavender flowers.",
      "price": 450,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Activated Charcoal Face Scrub",
      "description": "Exfoliating scrub with fine charcoal grains and tea tree oil to unclog skin pores.",
      "price": 299,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1607006342411-9a336f7de18a?w=600"
      ]
    },
    {
      "name": "Organic Cotton Cushion Covers",
      "description": "Set of 2 unbleached organic cotton canvas pillow covers with zip closures.",
      "price": 399,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"
      ]
    },
    {
      "name": "Sweet Almond Under Eye Cream",
      "description": "Nourishing cream loaded with cold-pressed almond oil and vitamins to target dark circles.",
      "price": 349,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600"
      ]
    },
    {
      "name": "Henna & Rosemary Hair Oil",
      "description": "Premature graying prevention hair oil formulated with bhringraj and rosemary extracts.",
      "price": 399,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Handwoven Khadi Table Runner",
      "description": "100% handloom thick cotton runner detailed with traditional border tassels.",
      "price": 599,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"
      ]
    }
  ],
  "clay-earth": [
    {
      "name": "Terracotta Water Jug",
      "description": "Traditional clay water jug that naturally cools drinking water through evaporation.",
      "price": 650,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ],
      "variants": [
        {
          "name": "Standard 1.5L",
          "price": 650,
          "stock": 30
        }
      ]
    },
    {
      "name": "Hand-painted Clay Cups (Set of 6)",
      "description": "Beautifully designed organic clay cups for tea (Chai) and coffee. Environmentally friendly.",
      "price": 450,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600"
      ],
      "variants": [
        {
          "name": "Set of 6",
          "price": 450,
          "stock": 50
        }
      ]
    },
    {
      "name": "Ceramic Plant Pot",
      "description": "Elegant, eco-friendly ceramic pot for indoor and outdoor plants. Adds a splash of green style.",
      "price": 890,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"
      ],
      "variants": [
        {
          "name": "Small",
          "price": 490,
          "stock": 20
        },
        {
          "name": "Medium",
          "price": 890,
          "stock": 20
        },
        {
          "name": "Large",
          "price": 1290,
          "stock": 20
        }
      ]
    },
    {
      "name": "Clay Cooking Pot (Handmade)",
      "description": "Traditional unglazed clay cooking pot. Retains essential nutrients and adds a rich, earthy flavor to foods.",
      "price": 799,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600"
      ],
      "variants": [
        {
          "name": "Medium 2.5L",
          "price": 799,
          "stock": 40
        }
      ]
    },
    {
      "name": "Terracotta Serving Bowl Set",
      "description": "Set of 3 nesting organic clay bowls ideal for curries, salads, or snacks.",
      "price": 999,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ]
    },
    {
      "name": "Ceramic Tea Mug (Handcrafted)",
      "description": "Individually thrown stoneware mug finished in a gorgeous forest green reactive glaze.",
      "price": 320,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"
      ]
    },
    {
      "name": "Clay Biryani Pot with Lid",
      "description": "Deep clay pot specially designed for slow-cooking traditional Biryani or stews.",
      "price": 850,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600"
      ]
    },
    {
      "name": "Terracotta Decorative Vase",
      "description": "Rustic dry-flower vase handcrafted by traditional artisans. For decorative use only.",
      "price": 590,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ]
    },
    {
      "name": "Ceramic Dining Plates (Set of 4)",
      "description": "Minimalist stoneware dinner plates with organic rims and speckled white glaze finish.",
      "price": 1899,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600"
      ]
    },
    {
      "name": "Hand-painted Clay Diya Set",
      "description": "Traditional oil lamps molded from river clay and painted with organic metallic colors.",
      "price": 199,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ]
    },
    {
      "name": "Terracotta Water Bottle",
      "description": "Travel-friendly clay bottle with a leakproof cork lid. Keeps water cool on the go.",
      "price": 499,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ]
    },
    {
      "name": "Clay Mortar and Pestle",
      "description": "Heavy-duty unglazed stoneware set perfect for grinding fresh spices and herbs.",
      "price": 399,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600"
      ]
    },
    {
      "name": "Ceramic Salt & Pepper Shakers",
      "description": "Hand-thrown clay shakers detailed with minimal vertical design carvings.",
      "price": 249,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600"
      ]
    },
    {
      "name": "Terracotta Wind Chimes",
      "description": "Clay bells suspended on natural jute strings. Produces a warm, earthy sound in the breeze.",
      "price": 450,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ]
    },
    {
      "name": "Ceramic Teapot (Handcrafted)",
      "description": "Beautiful teapot with an organic rattan handle and built-in stainless steel tea strainer.",
      "price": 799,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600"
      ]
    },
    {
      "name": "Clay Yogurt Pot (Dahi Handi)",
      "description": "Porous clay pot that absorbs excess moisture to set thick, creamy curd/yogurt.",
      "price": 299,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600"
      ]
    },
    {
      "name": "Ceramic Soap Dispenser",
      "description": "Refillable stoneware dispenser with a premium matte black rust-resistant pump.",
      "price": 399,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600"
      ]
    },
    {
      "name": "Terracotta Floor Urn",
      "description": "Large accent display urn molded on a traditional potter’s wheel. Exquisite rustic design.",
      "price": 2499,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600"
      ]
    },
    {
      "name": "Clay Roti Tawa (Griddle)",
      "description": "Organic clay flat griddle pane. Perfect for oil-free cooking of rotis and flatbreads.",
      "price": 349,
      "category": "Earthenware",
      "images": [
        "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600"
      ]
    },
    {
      "name": "Ceramic Salad Bowl (Large)",
      "description": "Wide serving bowl showcasing a unique hand-carved spiral design on the exterior.",
      "price": 850,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"
      ]
    }
  ],
  "green-tech": [
    {
      "name": "Solar Power Bank",
      "description": "Rugged, water-resistant 20,000mAh backup battery charged by solar energy. Built-in LED flashlight.",
      "price": 2499,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=600"
      ],
      "variants": [
        {
          "name": "Standard Edition",
          "price": 2499,
          "stock": 50
        }
      ]
    },
    {
      "name": "Biodegradable Phone Case",
      "description": "100% compostable and zero-waste protective case for iPhone and Android. Made from flax straw.",
      "price": 899,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600"
      ],
      "variants": [
        {
          "name": "Matte Forest Green",
          "price": 899,
          "stock": 60
        },
        {
          "name": "Matte Charcoal Black",
          "price": 899,
          "stock": 60
        }
      ]
    },
    {
      "name": "Bamboo Bluetooth Speaker",
      "description": "Portable wireless speaker made from sustainable natural bamboo. Deep bass and crystal-clear sound.",
      "price": 3299,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
      ],
      "variants": [
        {
          "name": "Wood Finish",
          "price": 3299,
          "stock": 30
        }
      ]
    },
    {
      "name": "Wheat Straw Wireless Mouse",
      "description": "Ergonomic 2.4G wireless mouse made from 40% biodegradable wheat straw material. Dual-mode connection.",
      "price": 1199,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600"
      ],
      "variants": [
        {
          "name": "Eco Oatmeal",
          "price": 1199,
          "stock": 65
        }
      ]
    },
    {
      "name": "Solar LED Desk Lamp",
      "description": "Flexible neck desk lamp with integrated solar charger panel. 3 levels of brightness.",
      "price": 1499,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=600"
      ]
    },
    {
      "name": "Cork Laptop Sleeve",
      "description": "Waterproof laptop sleeve padded with natural cork. Shock-absorbing soft fleece lining.",
      "price": 1299,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600"
      ]
    },
    {
      "name": "Reusable Smart Notebook",
      "description": "Write with any gel pen, scan notes to cloud storage, and wipe pages clean with a damp cloth.",
      "price": 1899,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600"
      ]
    },
    {
      "name": "Bamboo Mechanical Keyboard",
      "description": "Full layout mechanical keyboard constructed in a gorgeous solid bamboo frame.",
      "price": 6999,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"
      ]
    },
    {
      "name": "Solar Security Camera",
      "description": "Wireless outdoor security camera powered by a mini solar panel. Full HD night vision.",
      "price": 4999,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600"
      ]
    },
    {
      "name": "Wheat Straw Charging Cable",
      "description": "Multi-device fast charging cable with outer sleeve braided from natural flax and wheat straw.",
      "price": 399,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600"
      ]
    },
    {
      "name": "Bamboo Wireless Charger",
      "description": "15W fast charging dock constructed with sustainably sourced bamboo. Overcharge protection.",
      "price": 1499,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600"
      ]
    },
    {
      "name": "Recycled Plastic Earbuds",
      "description": "True wireless stereo earbuds built using 80% recycled post-consumer ABS plastics.",
      "price": 2499,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"
      ]
    },
    {
      "name": "Wood Finish USB Drive (64GB)",
      "description": "Elegant wooden shell thumb drive with high-speed USB 3.0 data transfer rate.",
      "price": 899,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600"
      ]
    },
    {
      "name": "Solar Powered Garden Lights",
      "description": "Set of 4 waterproof landscape path lights that charge in daylight and glow automatically at dusk.",
      "price": 1299,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600"
      ]
    },
    {
      "name": "Eco-friendly Laptop Stand",
      "description": "Foldable, lightweight laptop riser crafted from natural composite birch wood panels.",
      "price": 1899,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"
      ]
    },
    {
      "name": "Solar Powered Backpack",
      "description": "Anti-theft travel backpack equipped with an external 7W solar panel and USB ports.",
      "price": 3999,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
      ]
    },
    {
      "name": "Biodegradable Watch",
      "description": "Water-resistant analog wrist watch featuring a bamboo case and natural cork strap.",
      "price": 3499,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600"
      ]
    },
    {
      "name": "Recycled PET Desk Mat",
      "description": "Smooth felt desk protector pad constructed from recycled plastic bottles.",
      "price": 999,
      "category": "Accessories",
      "images": [
        "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600"
      ]
    },
    {
      "name": "Solar Window Charger",
      "description": "Window-suction battery bank with built-in solar panel. Sticks directly to glass.",
      "price": 1999,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=600"
      ]
    },
    {
      "name": "Bamboo Digital Wall Clock",
      "description": "LED clock displaying time, temperature, and humidity inside a modern bamboo block.",
      "price": 1599,
      "category": "Electronics",
      "images": [
        "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600"
      ]
    }
  ],
  "pure-bamboo": [
    {
      "name": "Bamboo Cutlery Set",
      "description": "Reusable organic bamboo fork, knife, spoon, and straw in a travel cotton pouch. Zero plastic.",
      "price": 499,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600"
      ],
      "variants": [
        {
          "name": "Single Set",
          "price": 499,
          "stock": 100
        },
        {
          "name": "Family Pack of 4",
          "price": 1699,
          "stock": 50
        }
      ]
    },
    {
      "name": "Organic Bamboo Sheets",
      "description": "Luxuriously soft, cooling, and hypoallergenic bed sheets made from 100% bamboo viscose.",
      "price": 2999,
      "category": "Bedding",
      "images": [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"
      ],
      "variants": [
        {
          "name": "Queen Size",
          "price": 2999,
          "stock": 20
        },
        {
          "name": "King Size",
          "price": 3499,
          "stock": 20
        }
      ]
    },
    {
      "name": "Bamboo Toothbrushes (Pack of 4)",
      "description": "Biodegradable bamboo toothbrushes with charcoal-infused soft bristles. Clean teeth, clean oceans.",
      "price": 299,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600"
      ],
      "variants": [
        {
          "name": "Family Pack",
          "price": 299,
          "stock": 200
        }
      ]
    },
    {
      "name": "Bamboo Toilet Paper (Pack of 12)",
      "description": "100% organic, tree-free toilet paper made from fast-growing bamboo fibers. Super soft, strong, and biodegradable.",
      "price": 899,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"
      ],
      "variants": [
        {
          "name": "12-Roll Pack",
          "price": 899,
          "stock": 110
        }
      ]
    },
    {
      "name": "Reusable Bamboo Towels",
      "description": "Single roll replaces up to 60 standard paper towel rolls. Machine washable and highly absorbent.",
      "price": 399,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600"
      ]
    },
    {
      "name": "Bamboo Hair Brush",
      "description": "Anti-static comb brush with natural bamboo bristles and handle. Massage scalp and stimulate growth.",
      "price": 349,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1590156546746-c58a70966a38?w=600"
      ]
    },
    {
      "name": "Bamboo Fiber Coffee Mug",
      "description": "Double-walled reusable travel mug made from compostable bamboo fibers. Silicone lid.",
      "price": 299,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"
      ]
    },
    {
      "name": "Bamboo Storage Baskets",
      "description": "Set of 2 stackable storage organizers woven with natural bamboo slats and cotton lining.",
      "price": 1199,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600"
      ]
    },
    {
      "name": "Bamboo Charcoal Odor Absorber",
      "description": "Natural charcoal air purifying bags. Absorbs moisture, dampness, and bad odors in closets.",
      "price": 249,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600"
      ]
    },
    {
      "name": "Bamboo Fiber Salad Bowl Set",
      "description": "Large modern serving bowl complete with matching bamboo servers. Biodegradable.",
      "price": 999,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600"
      ]
    },
    {
      "name": "Bamboo Bath Towel (Organic)",
      "description": "Item spun from organic bamboo fibers. Silky texture and quick drying.",
      "price": 899,
      "category": "Bedding",
      "images": [
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600"
      ]
    },
    {
      "name": "Bamboo Drinking Straws",
      "description": "Pack of 8 reusable solid bamboo straws. Includes a cleaning brush and travel pouch.",
      "price": 199,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600"
      ]
    },
    {
      "name": "Bamboo Chopping Board",
      "description": "Heavy-duty cutting board with a side drip groove. Easy on knife blades.",
      "price": 699,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600"
      ]
    },
    {
      "name": "Bamboo Roll-Up Bath Mat",
      "description": "Water-resistant slatted bathroom mat with non-slip backing rubber pads.",
      "price": 999,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600"
      ]
    },
    {
      "name": "Bamboo Makeup Pads (Pack of 16)",
      "description": "Washable makeup remover pads.",
      "price": 349,
      "category": "Personal Care",
      "images": [
        "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600"
      ]
    },
    {
      "name": "Bamboo Plant Stand (3-Tier)",
      "description": "Corner plant stand.",
      "price": 1499,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600"
      ]
    },
    {
      "name": "Bamboo Kids Dinnerware Set",
      "description": "Fun 5-piece meal set.",
      "price": 799,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=600"
      ]
    },
    {
      "name": "Zero-Waste Bamboo Soap Dish",
      "description": "Self-draining wooden soap holder.",
      "price": 149,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1607006342411-9a336f7de18a?w=600"
      ]
    },
    {
      "name": "Bamboo Laptop Bed Tray Desk",
      "description": "Folding lap desk table.",
      "price": 1899,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600"
      ]
    },
    {
      "name": "Bamboo Laundry Hamper",
      "description": "Hamper basket.",
      "price": 1599,
      "category": "Household",
      "images": [
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600"
      ]
    }
  ],
  "herbal-garden": [
    {
      "name": "Lavender Essential Oil",
      "description": "100% pure therapeutic grade lavender oil. Promotes relaxation, calm sleep, and skin soothing.",
      "price": 599,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ],
      "variants": [
        {
          "name": "10ml Bottle",
          "price": 599,
          "stock": 50
        },
        {
          "name": "30ml Bottle",
          "price": 1299,
          "stock": 25
        }
      ]
    },
    {
      "name": "Charcoal Handmade Soap",
      "description": "Natural detoxifying soap bar made with activated charcoal and organic coconut oil. Unscented.",
      "price": 199,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1607006342411-9a336f7de18a?w=600"
      ],
      "variants": [
        {
          "name": "100g Bar",
          "price": 199,
          "stock": 100
        }
      ]
    },
    {
      "name": "Organic Aloe Vera Gel",
      "description": "99% pure aloe vera gel directly extracted from plants. Soothes sunburn, hydrates hair and dry skin.",
      "price": 349,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600"
      ],
      "variants": [
        {
          "name": "150ml Tube",
          "price": 349,
          "stock": 80
        }
      ]
    },
    {
      "name": "Holy Basil (Tulsi) Potted Plant",
      "description": "Potted organic Tulsi plant in a biodegradable clay pot. Revered for its medicinal properties and air purification.",
      "price": 299,
      "category": "Plants",
      "images": [
        "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600"
      ],
      "variants": [
        {
          "name": "Live Plant with Pot",
          "price": 299,
          "stock": 50
        }
      ]
    },
    {
      "name": "Peppermint Essential Oil",
      "description": "Pure peppermint oil. Cool, tingling sensation provides relief from headaches and sinus blockages.",
      "price": 549,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Aloe Vera Live Plant",
      "description": "Fresh, air-purifying live aloe plant shipped in a durable nursery grow cup.",
      "price": 329,
      "category": "Plants",
      "images": [
        "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=600"
      ]
    },
    {
      "name": "Organic Tea Tree Oil",
      "description": "Natural antibacterial essential oil. Popular spot treatment for acne and scalp health.",
      "price": 620,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Neem & Turmeric Soap Bar",
      "description": "Clarifying skin cleanser handcrafted with cold-pressed oils and pure neem extracts.",
      "price": 149,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1607006342411-9a336f7de18a?w=600"
      ]
    },
    {
      "name": "Pure Rose Water Mist (100ml)",
      "description": "Steam distilled petals of Damask roses. Balancing skin toner and facial refreshing spray.",
      "price": 249,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600"
      ]
    },
    {
      "name": "Rosemary Essential Oil",
      "description": "Stimulates focus, mental clarity, and supports strong hair follicle development.",
      "price": 599,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Spearmint Herb Live Plant",
      "description": "Organic live mint plant. Perfect for kitchen garden window-sill herb boxes.",
      "price": 249,
      "category": "Plants",
      "images": [
        "https://images.unsplash.com/photo-1588748332162-88229b0a1740?w=600"
      ]
    },
    {
      "name": "Jasmine Herbal Massage Oil",
      "description": "Relaxing body massage oil base of cold pressed sesame infused with fresh jasmine buds.",
      "price": 450,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Organic Clay Herbal Hair Mask",
      "description": "Deep scalp-purifying hair pack blended with bentonite clay, neem, and hibiscus.",
      "price": 399,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600"
      ]
    },
    {
      "name": "Eucalyptus Essential Oil",
      "description": "100% pure oil. Refreshing woody aroma ideal for steam inhalation and diffuser baths.",
      "price": 549,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Lemongrass Potted Herb",
      "description": "Fast growing live lemongrass plant. Keeps mosquitoes away naturally.",
      "price": 299,
      "category": "Plants",
      "images": [
        "https://images.unsplash.com/photo-1512428813824-f713c2448503?w=600"
      ]
    },
    {
      "name": "Herbal beeswax Lip Balm",
      "description": "Locks in deep moisture. Handcrafted using raw honey, beeswax, and sweet orange oil.",
      "price": 149,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600"
      ]
    },
    {
      "name": "Sandalwood Premium Essential Oil",
      "description": "Warm woody aroma. Highly prized in aromatherapy for grounding, focus, and wellness.",
      "price": 1299,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    },
    {
      "name": "Lavender Organic Body Butter",
      "description": "Ultra rich moisturizing cream made with raw shea butter and organic lavender oil.",
      "price": 499,
      "category": "Skincare",
      "images": [
        "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600"
      ]
    },
    {
      "name": "Live Oregano Herb Plant",
      "description": "Fresh oregano potted plant ready to harvest for home-cooked pizzas and pastas.",
      "price": 249,
      "category": "Plants",
      "images": [
        "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600"
      ]
    },
    {
      "name": "Herbal Mosquito Repellent Spray",
      "description": "Citronella and lemongrass based body mist. Non-toxic protection.",
      "price": 299,
      "category": "Wellness",
      "images": [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
      ]
    }
  ],
  "green-wardrobe": [
    {
      "name": "Organic Cotton T-Shirt",
      "description": "100% GOTS organic cotton.",
      "price": 1299,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"
      ],
      "variants": [
        {
          "name": "S",
          "price": 1299,
          "stock": 25
        },
        {
          "name": "M",
          "price": 1299,
          "stock": 25
        },
        {
          "name": "L",
          "price": 1299,
          "stock": 25
        }
      ]
    },
    {
      "name": "Hemp Denim Jeans",
      "description": "Blue jeans.",
      "price": 3499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
      ],
      "variants": [
        {
          "name": "Waist 30",
          "price": 3499,
          "stock": 20
        },
        {
          "name": "Waist 32",
          "price": 3499,
          "stock": 20
        }
      ]
    },
    {
      "name": "Bamboo Fiber Socks (Pack of 3)",
      "description": "Bamboo socks.",
      "price": 499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=600"
      ],
      "variants": [
        {
          "name": "Standard Pack",
          "price": 499,
          "stock": 120
        }
      ]
    },
    {
      "name": "Recycled Polyester Jacket",
      "description": "Sports jacket.",
      "price": 4599,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
      ],
      "variants": [
        {
          "name": "M",
          "price": 4599,
          "stock": 15
        },
        {
          "name": "L",
          "price": 4599,
          "stock": 15
        }
      ]
    },
    {
      "name": "Organic Cotton Canvas Tote Bag",
      "description": "Canvas tote bag.",
      "price": 399,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600"
      ],
      "variants": [
        {
          "name": "Natural White",
          "price": 399,
          "stock": 150
        }
      ]
    },
    {
      "name": "Linen Summer Dress",
      "description": "Cotton linen dress.",
      "price": 2899,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600"
      ]
    },
    {
      "name": "Tencel Casual Shorts",
      "description": "Comfortable shorts.",
      "price": 1699,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
      ]
    },
    {
      "name": "Organic Cotton Hoodie",
      "description": "Cozy hoodie.",
      "price": 2499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600"
      ]
    },
    {
      "name": "Hemp Canvas Sneakers",
      "description": "Sneakers.",
      "price": 3299,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
      ]
    },
    {
      "name": "Recycled Cotton Scarf",
      "description": "Winter wrap scarf.",
      "price": 599,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
      ]
    },
    {
      "name": "Linen Button-up Shirt",
      "description": "Soft shirt.",
      "price": 1899,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
      ]
    },
    {
      "name": "Bamboo Fiber Activewear Leggings",
      "description": "Tight active leggings.",
      "price": 1999,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600"
      ]
    },
    {
      "name": "Reclaimed Leather Belt",
      "description": "Repurposed leather belt.",
      "price": 999,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
      ]
    },
    {
      "name": "Organic Cotton Beanie",
      "description": "Beanie cap.",
      "price": 499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"
      ]
    },
    {
      "name": "Hemp Fiber Backpack",
      "description": "Durable backpack.",
      "price": 2899,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
      ]
    },
    {
      "name": "Recycled Windbreaker Jacket",
      "description": "Jacket.",
      "price": 3499,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
      ]
    },
    {
      "name": "Tencel Lounge Trousers",
      "description": "Sweatpants.",
      "price": 1899,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1515438084819-7ce3a8147e1?w=600"
      ]
    },
    {
      "name": "Organic Cotton Pajama Set",
      "description": "Pajamas shirt/pants.",
      "price": 1999,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"
      ]
    },
    {
      "name": "Linen Drawstring Trousers",
      "description": "Linen pants.",
      "price": 2199,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"
      ]
    },
    {
      "name": "Recycled Wool Winter Gloves",
      "description": "Warm knit gloves.",
      "price": 799,
      "category": "Apparel",
      "images": [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
      ]
    }
  ],
  "eco-home": [
    {
      "name": "Reclaimed Wood Coffee Table",
      "description": "Coffee table.",
      "price": 8999,
      "category": "Furniture",
      "images": [
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600"
      ],
      "variants": [
        {
          "name": "Standard Size",
          "price": 8999,
          "stock": 10
        }
      ]
    },
    {
      "name": "Handwoven Jute Rug",
      "description": "Rug.",
      "price": 2499,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600"
      ],
      "variants": [
        {
          "name": "4x6 ft",
          "price": 2499,
          "stock": 15
        },
        {
          "name": "5x8 ft",
          "price": 3999,
          "stock": 10
        }
      ]
    },
    {
      "name": "Soy Wax Scented Candle",
      "description": "Soy candle.",
      "price": 699,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600"
      ],
      "variants": [
        {
          "name": "Lavender-Eucalyptus",
          "price": 699,
          "stock": 40
        },
        {
          "name": "Vanilla-Sandalwood",
          "price": 699,
          "stock": 40
        }
      ]
    },
    {
      "name": "Coconut Shell Bowl Set",
      "description": "Coconut bowl.",
      "price": 1199,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
      ],
      "variants": [
        {
          "name": "Set of 4",
          "price": 1199,
          "stock": 50
        }
      ]
    },
    {
      "name": "Recycled Cotton Throw Pillows",
      "description": "Throw pillows.",
      "price": 899,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"
      ],
      "variants": [
        {
          "name": "Set of 2 (18x18\")",
          "price": 899,
          "stock": 45
        }
      ]
    },
    {
      "name": "Handwoven Cotton Throw Blanket",
      "description": "Knit blanket.",
      "price": 1499,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"
      ]
    },
    {
      "name": "Bamboo Picture Frame",
      "description": "Picture frame.",
      "price": 499,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"
      ]
    },
    {
      "name": "Cork Coasters (Set of 6)",
      "description": "Coasters.",
      "price": 299,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"
      ]
    },
    {
      "name": "Macrame Jute Wall Hanging",
      "description": "Wall tapestry.",
      "price": 999,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600"
      ]
    },
    {
      "name": "Reclaimed Floating Shelves",
      "description": "Shelves.",
      "price": 1899,
      "category": "Furniture",
      "images": [
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600"
      ]
    },
    {
      "name": "Organic Linen Tablecloth",
      "description": "Tablecloth.",
      "price": 1299,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600"
      ]
    },
    {
      "name": "Coconut Shell Soy Candle",
      "description": "Candle.",
      "price": 599,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600"
      ]
    },
    {
      "name": "Seagrass Storage Basket Set",
      "description": "Seagrass baskets.",
      "price": 1499,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600"
      ]
    },
    {
      "name": "Recycled Glass Flower Vase",
      "description": "Glass vase.",
      "price": 799,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"
      ]
    },
    {
      "name": "Dried Lavender Bouquet",
      "description": "Lavender bouquet.",
      "price": 399,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600"
      ]
    },
    {
      "name": "Reclaimed Wood Wall Clock",
      "description": "Wall clock.",
      "price": 1599,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600"
      ]
    },
    {
      "name": "Jute Placemats (Set of 4)",
      "description": "Jute mats.",
      "price": 699,
      "category": "Kitchenware",
      "images": [
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600"
      ]
    },
    {
      "name": "Organic Cotton Cushion Cover",
      "description": "Cushion cover.",
      "price": 399,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"
      ]
    },
    {
      "name": "Bamboo Desk Organizer",
      "description": "Desk organizer.",
      "price": 899,
      "category": "Furniture",
      "images": [
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"
      ]
    },
    {
      "name": "Recycled Cotton Tapestry",
      "description": "Tapestry/rug.",
      "price": 1199,
      "category": "Home Decor",
      "images": [
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600"
      ]
    }
  ],
  "eco-stationery": [
    {
      "name": "Bamboo Ballpoint Pens (Pack of 5)",
      "description": "Smooth writing retractable ballpoint pens with natural bamboo barrels and black ink.",
      "price": 399,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"],
      "variants": [{ "name": "Pack of 5", "price": 399, "stock": 120 }]
    },
    {
      "name": "Recycled Kraft Paper Journal",
      "description": "A5 size notebook with 160 pages of recycled post-consumer waste paper. Durable hard cover.",
      "price": 499,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600"],
      "variants": [{ "name": "A5 Journal", "price": 499, "stock": 80 }]
    },
    {
      "name": "Natural Cork Pencil Case",
      "description": "Eco-friendly, water-resistant pencil pouch made from harvested cork oak bark.",
      "price": 299,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"],
      "variants": [{ "name": "Standard", "price": 299, "stock": 95 }]
    },
    {
      "name": "Handmade Seed Paper Notebook",
      "description": "Cover and pages infused with wildflower seeds. Plant the pages after use to grow flowers.",
      "price": 349,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600"]
    },
    {
      "name": "Biodegradable Paper Clips (100 Pack)",
      "description": "Rust-resistant steel clips coated with fully biodegradable plant-based starch plastics.",
      "price": 149,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"]
    },
    {
      "name": "Bamboo Desk Organizer",
      "description": "Multi-compartment storage dock for pens, notes, and smartphone, crafted from solid bamboo.",
      "price": 899,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"]
    },
    {
      "name": "Recycled Kraft Envelopes (Pack of 50)",
      "description": "Self-sealing multipurpose mailing envelopes made from 100% recycled brown kraft paper.",
      "price": 249,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"]
    },
    {
      "name": "Organic Cotton Book Sleeve",
      "description": "Padded protective sleeve to keep your books and tablets safe while traveling.",
      "price": 450,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600"]
    },
    {
      "name": "Bamboo Desk Ruler (30cm)",
      "description": "Classic metric and imperial measuring ruler made from strong, sustainable bamboo.",
      "price": 129,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"]
    },
    {
      "name": "Eco-friendly Watercolor Palette",
      "description": "Non-toxic organic pigments set in a biodegradable wheat straw mixing tray.",
      "price": 799,
      "category": "Stationery",
      "images": ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600"]
    }
  ],
  "solar-mobility": [
    {
      "name": "Solar Powered E-Bike Conversion Kit",
      "description": "Convert any standard bicycle into a solar-assisted hybrid electric bike. Includes 50W panel and hub motor.",
      "price": 24999,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"],
      "variants": [{ "name": "Standard Kit", "price": 24999, "stock": 10 }]
    },
    {
      "name": "Solar Charging Smart Helmet",
      "description": "Integrated solar panel charges built-in bluetooth speakers, mic, and rear LED safety lights.",
      "price": 3499,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600"],
      "variants": [{ "name": "Universal Fit", "price": 3499, "stock": 25 }]
    },
    {
      "name": "Waterproof Solar Pannier Bag",
      "description": "Rear rack bicycle bag featuring a detachable 10W solar charger to power your devices on the go.",
      "price": 2899,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"]
    },
    {
      "name": "Handcrafted Bamboo Frame Bicycle",
      "description": "Stunning lightweight road bike frame handcrafted from cured structural bamboo poles.",
      "price": 45000,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600"]
    },
    {
      "name": "Solar Powered LED Bike Light Set",
      "description": "Super bright front and rear lights that recharge under sunlight. Fully waterproof.",
      "price": 899,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"]
    },
    {
      "name": "Recycled Rubber Bike Tires (Pair)",
      "description": "High-traction hybrid road tires manufactured from 50% recycled vehicle tires.",
      "price": 1599,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600"]
    },
    {
      "name": "Smart Solar Bike U-Lock",
      "description": "Heavy-duty steel lock featuring solar-assisted fingerprint scanning and app tracking.",
      "price": 4599,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"]
    },
    {
      "name": "Reflective Eco-safety Vest",
      "description": "High visibility safety vest woven from 100% recycled polyester neon threads.",
      "price": 399,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600"]
    },
    {
      "name": "Biodegradable Bike Chain Lube",
      "description": "Plant-based, non-toxic wet lubricant designed for extreme gear protection and zero environmental runoff.",
      "price": 249,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"]
    },
    {
      "name": "Solar Portable Bike Pump",
      "description": "Electric air compressor pump with solar charging and built-in emergency phone powerbank.",
      "price": 1899,
      "category": "Mobility",
      "images": ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600"]
    }
  ],
  "eco-clean": [
    {
      "name": "Eco Laundry Detergent Sheets (60 Packs)",
      "description": "Plant-based laundry detergent sheets, plastic-free, hypoallergenic and highly effective.",
      "price": 499,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1610555356070-d0efb6505f81?w=600"],
      "variants": [
        { "name": "Fresh Linen", "price": 499, "stock": 50 },
        { "name": "Fragrance Free", "price": 499, "stock": 40 }
      ]
    },
    {
      "name": "Bamboo Dish Brushes (Set of 3)",
      "description": "Natural coconut and sisal fiber brushes. Ideal for non-scratch kitchen scrubbing.",
      "price": 299,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Refillable Multi-Surface Cleaner",
      "description": "Concentrated cleaning tablet with reusable amber glass spray bottle. Just add water.",
      "price": 399,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Natural Dishwasher Tablets (40 Tabs)",
      "description": "Biodegradable, phosphate-free dishwasher detergent tabs with water-soluble film.",
      "price": 599,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1610555356070-d0efb6505f81?w=600"]
    },
    {
      "name": "Organic Cotton Cleaning Cloths (Set of 5)",
      "description": "Washable, super absorbent and completely compostable cotton cleaning wipes.",
      "price": 249,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600"]
    },
    {
      "name": "Castile Liquid Soap (500ml)",
      "description": "Unscented organic Castile soap made from organic olive and coconut oils.",
      "price": 699,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"]
    },
    {
      "name": "Eucalyptus Toilet Cleaner (750ml)",
      "description": "Non-toxic acidic formula with organic eucalyptus oils to clean and refresh.",
      "price": 249,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Compostable Trash Bags (30L, 25 Bags)",
      "description": "BPI certified compostable garbage bags made of cornstarch composite.",
      "price": 349,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1610555356070-d0efb6505f81?w=600"]
    },
    {
      "name": "Natural Wood Polish Spray (250ml)",
      "description": "Plant-derived protective oil blend with organic beeswax for beautiful shine.",
      "price": 299,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Wool Dryer Balls (Set of 6)",
      "description": "100% New Zealand wool balls. Reusable fabric softener that cuts drying time.",
      "price": 449,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"]
    },
    {
      "name": "Citrus Glass Cleaner Refill",
      "description": "Concentrate tablets for sparkling glass surfaces without streak marks.",
      "price": 199,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Coconut Husk Scrubber (Pack of 4)",
      "description": "Scratch-free biodegradable scrub pads made of coconut coir fiber.",
      "price": 149,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Eco Hand Wash Refill Pouch",
      "description": "Foam hand soap concentrate with natural lavender oil essence.",
      "price": 299,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"]
    },
    {
      "name": "Natural Odor Eliminator Spray",
      "description": "Safe, non-toxic plant-extract odor neutralizer for rooms and pet areas.",
      "price": 320,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Copper Scouring Pads (Set of 3)",
      "description": "Heavy-duty copper pads for pots, pans and stainless steel surfaces cleaning.",
      "price": 199,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Beeswax Food Wraps (Pack of 3)",
      "description": "Reusable organic cotton wraps coated with beeswax and jojoba oil.",
      "price": 399,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"]
    },
    {
      "name": "Luffa Sponge (Pack of 3)",
      "description": "Natural loofah sponge gourds for kitchen cleaning and body exfoliation.",
      "price": 149,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Baking Soda Cleaning Paste",
      "description": "Extra-strength scrub paste with baking soda for tough grease and stains.",
      "price": 199,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    },
    {
      "name": "Tea Tree Hand Sanitizer (50ml)",
      "description": "Alcohol-free plant-based sanitizer with skin conditioning aloe vera.",
      "price": 99,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600"]
    },
    {
      "name": "Recycled Plastic Bucket (10L)",
      "description": "Sturdy bucket made of 100% post-consumer recycled plastic.",
      "price": 299,
      "category": "Household",
      "images": ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600"]
    }
  ],
  "thrift-thread": [
    {
      "name": "Upcycled Denim Jacket",
      "description": "Remade from vintage cotton jeans. Unique patchwork style jacket.",
      "price": 2499,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"],
      "variants": [
        { "name": "Medium", "price": 2499, "stock": 5 },
        { "name": "Large", "price": 2699, "stock": 3 }
      ]
    },
    {
      "name": "Vintage Flannel Shirt",
      "description": "Classic 90s soft flannel shirt in checks pattern. High quality cotton.",
      "price": 999,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Retro Knit Sweater",
      "description": "80s vintage pattern cozy wool sweater. Earth tone colors.",
      "price": 1899,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Recycled Cotton Tote Bag",
      "description": "Heavyweight screenprinted vintage tote made from recycled industrial scraps.",
      "price": 299,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=600"]
    },
    {
      "name": "Upcycled Patchwork Cap",
      "description": "Made from recycled vintage fabric offcuts. Adjustable strap.",
      "price": 499,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"]
    },
    {
      "name": "Vintage Leather Boots",
      "description": "Classic unisex leather boots, fully restored and conditioned.",
      "price": 3499,
      "category": "Footwear",
      "images": ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"]
    },
    {
      "name": "Secondhand Linen Trousers",
      "description": "High-rise vintage linen pants in sand white shade. Lightweight.",
      "price": 1499,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Upcycled Tote Backpack",
      "description": "Convertible backpack bag made from heavy-duty vintage military canvas.",
      "price": 1899,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"]
    },
    {
      "name": "Retro Windbreaker Jacket",
      "description": "80s colorblock windbreaker with hood. Water-resistant nylon.",
      "price": 2199,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"]
    },
    {
      "name": "Vintage Graphic Tee",
      "description": "70s rock band faded concert tee. Soft vintage cotton feel.",
      "price": 799,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"]
    },
    {
      "name": "Upcycled Corduroy Shorts",
      "description": "Remade shorts tailored from high quality vintage corduroy trousers.",
      "price": 899,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"]
    },
    {
      "name": "Vintage Trench Coat",
      "description": "Double-breasted classic beige trench coat with waist belt.",
      "price": 2999,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Recycled Wool Scarf",
      "description": "Cozy knit winter scarf made from 100% repurposed wool fibers.",
      "price": 599,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Vintage Silk Scarf",
      "description": "Colorful neck scarf patterned in unique hand-printed designs.",
      "price": 399,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Secondhand Floral Dress",
      "description": "70s floral sundress in organic linen. Beautifully preserved.",
      "price": 1699,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600"]
    },
    {
      "name": "Vintage Denim Overall",
      "description": "Classic light wash blue overall with metal button accents.",
      "price": 2299,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"]
    },
    {
      "name": "Upcycled Bucket Hat",
      "description": "Reversible sun hat handmade from vintage denim scrap fabrics.",
      "price": 399,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600"]
    },
    {
      "name": "Retro Fleece Pullover",
      "description": "Warm half-zip fleece sweater from the late 90s. Cleaned and restored.",
      "price": 1299,
      "category": "Apparel",
      "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"]
    },
    {
      "name": "Vintage Leather Belt",
      "description": "Brown leather belt with distressed details and solid brass buckle.",
      "price": 599,
      "category": "Accessories",
      "images": ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"]
    },
    {
      "name": "Recycled Canvas Sneakers",
      "description": "Classic low-top canvas sneakers made from recycled cotton canvas.",
      "price": 1499,
      "category": "Footwear",
      "images": ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600"]
    }
  ]
};


    // === SEED ALL 200 PRODUCTS IN BATCH ===

    console.log('Seeding 20 products per store (200 products total)...');
    
    // Map of store slugs to store IDs
    const storeMap = {
      'nike': store1._id,
      'organic-india': store3._id,
      'khadi-naturals': store4._id,
      'clay-earth': store5._id,
      'green-tech': store6._id,
      'pure-bamboo': store7._id,
      'herbal-garden': store8._id,
      'green-wardrobe': store9._id,
      'eco-home': store10._id,
      'eco-stationery': store11._id,
      'solar-mobility': store12._id,
      'eco-clean': store13._id,
      'thrift-thread': store14._id
    };

    // Keep track of some seeded products to link sample orders
    let orderProduct1Id, orderProduct2Id, orderProduct3Id, orderProduct4Id;

    for (const [slug, storeId] of Object.entries(storeMap)) {
      const productsData = productPools[slug];
      if (!productsData) continue;

      for (let i = 0; i < productsData.length; i++) {
        const item = productsData[i];
        
        // Define default variants if none specified
        const variants = item.variants || [
          { name: 'Standard', price: item.price, stock: 50 }
        ];

        const product = await Product.create({
          store: storeId,
          name: item.name,
          description: item.description,
          price: item.price,
          images: item.images,
          category: item.category || 'General',
          stock: item.stock || 50,
          variants: variants
        });

        // Store references for sample orders
        if (slug === 'nike' && i === 0) orderProduct1Id = product._id;
        if (slug === 'nike' && i === 1) orderProduct2Id = product._id;
        if (slug === 'organic-india' && i === 0) orderProduct3Id = product._id;
        if (slug === 'organic-india' && i === 1) orderProduct4Id = product._id;
      }
      console.log(`Seeded 20 products for ${slug} store.`);
    }

    // 13. Seed initial orders (using INR prices)
    await Order.create({
      store: store1._id,
      customer: customer1._id,
      items: [{
        product: orderProduct1Id,
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
        product: orderProduct2Id,
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
        product: orderProduct3Id,
        name: 'Organic Tulsi Green Tea',
        quantity: 2,
        price: 250,
        variantName: '100g Pack'
      }, {
        product: orderProduct4Id,
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
    console.error(`Error seeding database: ${error.stack || error.message}`);
    process.exit(1);
  }
};

seedData();
