const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');
const Store = require('../models/Store');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkImages = async () => {
  try {
    const localURI = 'mongodb://127.0.0.1:27017/the_eco';
    console.log('Connecting to local DB...');
    await mongoose.connect(localURI);
    console.log('Connected.');

    const products = await Product.find({}).populate('store');
    console.log(`Checking ${products.length} products...`);
    
    let missingImagesCount = 0;
    let emptyImagesCount = 0;
    
    for (const p of products) {
      if (!p.images) {
        missingImagesCount++;
        console.log(`Product: "${p.name}" in store "${p.store?.name}" has undefined images!`);
      } else if (p.images.length === 0) {
        emptyImagesCount++;
        console.log(`Product: "${p.name}" in store "${p.store?.name}" has 0 images!`);
      } else {
        // Check if image link starts with http or is empty
        const invalidImages = p.images.filter(img => !img || !img.startsWith('http'));
        if (invalidImages.length > 0) {
          console.log(`Product: "${p.name}" in store "${p.store?.name}" has invalid image links:`, p.images);
        }
      }
    }

    console.log(`Check complete: undefined images=${missingImagesCount}, empty images=${emptyImagesCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkImages();
