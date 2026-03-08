import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const imageMap = {
  'Electric Chakkar': '/images/products/electric-chakkar.png',
  'Whistling Chakkar': '/images/products/whistling-chakkar.png',
  'Super Chakkar Big': '/images/products/super-chakkar-big.png',
  'Deluxe Ground Chakkar': '/images/products/deluxe-ground-chakkar.png',
  'Crackling Flower Pot': '/images/products/crackling-flower-pot.png',
  'Small Flower Pot': '/images/products/small-flower-pot.png',
  'Medium Flower Pot': '/images/products/medium-flower-pot.png',
  'Large Flower Pot': '/images/products/large-flower-pot.png',
  'Rainbow Flower Pot': '/images/products/rainbow-flower-pot.png',
  'Super Deluxe Flower Pot': '/images/products/super-deluxe-flower-pot.png'
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const results = [];

  for (const [name, imageUrl] of Object.entries(imageMap)) {
    const product = await Product.findOneAndUpdate(
      { name },
      { $set: { imageUrl } },
      { new: true }
    ).select('name imageUrl');

    if (product) {
      results.push(`✔ ${product.name} -> ${product.imageUrl}`);
    } else {
      results.push(`✖ Not found: ${name}`);
    }
  }

  console.log('Updated image URLs:');
  for (const line of results) {
    console.log(line);
  }

  await mongoose.disconnect();
};

run()
  .catch(async (error) => {
    console.error('Failed to update product images:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
