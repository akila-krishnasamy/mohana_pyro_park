import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://akilak23cse_db_user:hRKuM2xtjGW26HgW@cluster0.ododkjk.mongodb.net/mohana_pyro_park?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(mongoUri);

  const products = await Product.find({ isActive: true }).select('_id name imageUrl').lean();

  const mappings = [
    { keys: ['5000', 'wala'], img: '/api/uploads/products/5000-walas-crackers.jpg' },
    { keys: ['1000', 'wala'], img: '/api/uploads/products/1000Wala.webp' },
    { keys: ['dragon', 'bomb'], img: '/api/uploads/products/DragonBomb.jpg' },
    { keys: ['classic', 'atom', 'bomb'], img: '/api/uploads/products/ClassicAtomBomb.jpg' },
    { keys: ['atom', 'bomb'], img: '/api/uploads/products/AtomBomb.png' },
    { keys: ['hydro', 'bomb'], img: '/api/uploads/products/DragonBomb.jpg' },
    { keys: ['hydrogen', 'bomb'], img: '/api/uploads/products/DragonBomb.jpg' },
    { keys: ['pubg', 'bomb'], img: '/api/uploads/products/DragonBomb.jpg' },
    { keys: ['paper', 'bomb'], img: '/api/uploads/products/ClassicAtomBomb.jpg' },
    { keys: ['bomb'], img: '/api/uploads/products/AtomBomb.png' },
    { keys: ['red', 'bijili'], img: '/api/uploads/products/RedBijilli.jpg' },
    { keys: ['lakshmi'], img: '/api/uploads/products/Lakshmi.webp' },
    { keys: ['kuruvi'], img: '/api/uploads/products/Kuruvi.jpg' }
  ];

  const operations = [];

  for (const product of products) {
    const text = (product.name || '').toLowerCase();
    const match = mappings.find((mapping) => mapping.keys.every((key) => text.includes(key)));

    if (!match) continue;
    if (product.imageUrl === match.img) continue;

    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { imageUrl: match.img } }
      }
    });
  }

  if (operations.length > 0) {
    await Product.bulkWrite(operations);
  }

  console.log(JSON.stringify({ scanned: products.length, updated: operations.length }));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
