import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://akilak23cse_db_user:hRKuM2xtjGW26HgW@cluster0.ododkjk.mongodb.net/mohana_pyro_park?retryWrites=true&w=majority&appName=Cluster0';

const keywordRules = [
  { keywords: ['5000', 'wala'], image: '/api/uploads/products/5000-walas-crackers.jpg' },
  { keywords: ['1000', 'wala'], image: '/api/uploads/products/1000Wala.webp' },
  { keywords: ['dragon', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
  { keywords: ['classic', 'atom', 'bomb'], image: '/api/uploads/products/ClassicAtomBomb.jpg' },
  { keywords: ['atom', 'bomb'], image: '/api/uploads/products/AtomBomb.png' },
  { keywords: ['hydrogen', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
  { keywords: ['hydro', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
  { keywords: ['pubg', 'bomb'], image: '/api/uploads/products/DragonBomb.jpg' },
  { keywords: ['paper', 'bomb'], image: '/api/uploads/products/ClassicAtomBomb.jpg' },
  { keywords: ['bomb'], image: '/api/uploads/products/AtomBomb.png' },
  { keywords: ['red', 'bijili'], image: '/api/uploads/products/RedBijilli.jpg' },
  { keywords: ['lakshmi'], image: '/api/uploads/products/Lakshmi.webp' },
  { keywords: ['kuruvi'], image: '/api/uploads/products/Kuruvi.jpg' },

  // Skyshots from uploaded images
  { keywords: ['100', 'grand', 'shot'], image: '/api/uploads/products/100 grand shot.jpg' },
  { keywords: ['50', 'shot'], image: '/api/uploads/products/50 shots.jpg' },
  { keywords: ['25', 'shot'], image: '/api/uploads/products/25 shots.jpg' },
  { keywords: ['12', 'shot'], image: '/api/uploads/products/12 shots.jpg' },
  { keywords: ['sky', 'shot'], image: '/api/uploads/products/SkyShotRocket.png' },
  { keywords: ['skyshot'], image: '/api/uploads/products/SkyShotRocket.png' },

  // Sparklers from uploaded images
  { keywords: ['10cm', 'sparkler'], image: '/api/uploads/products/10cm Sparklers.webp' },
  { keywords: ['15cm', 'sparkler'], image: '/api/uploads/products/15cm Sparklers.jpg' },
  { keywords: ['30cm', 'sparkler'], image: '/api/uploads/products/30cm sparklers.jpg' },
  { keywords: ['electric', 'sparkler'], image: '/api/uploads/products/electric sparkler.jpg' },
  { keywords: ['colour', 'sparkler'], image: '/api/uploads/products/colour sparklers.jpg' },
  { keywords: ['pencil', 'sparkler'], image: '/api/uploads/products/pencil sparklers.jpg' },
  { keywords: ['color', 'sparkler'], image: '/api/uploads/products/colour sparklers.jpg' },

  // Fancy items from uploaded images
  { keywords: ['twinkling', 'star'], image: '/api/uploads/products/TwinklingStars.webp' },
  { keywords: ['peacock', 'wheel'], image: '/api/uploads/products/PeacockWheel.webp' },
  { keywords: ['wheel'], image: '/api/uploads/products/PeacockWheel.webp' },
  { keywords: ['fountain'], image: '/api/uploads/products/magicFountain.jpg' },
  { keywords: ['multicolor', 'fountain'], image: '/api/uploads/products/multicolorFoundation.jpg' },
  { keywords: ['multi', 'color', 'fountain'], image: '/api/uploads/products/multicolorFoundation.jpg' },
  { keywords: ['fancy', 'fountain'], image: '/api/uploads/products/magicFountain.jpg' },
  { keywords: ['fancy', 'cracker'], image: '/api/uploads/products/SuperDeluxe.png' },
  { keywords: ['chotta', 'fancy'], image: '/api/uploads/products/SuperDeluxe.png' },
  { keywords: ['super', 'man', 'fancy'], image: '/api/uploads/products/SuperDeluxe.png' },
  { keywords: ['iron', 'man', 'fancy'], image: '/api/uploads/products/SuperDeluxe.png' },
  { keywords: ['captain', 'america', 'fancy'], image: '/api/uploads/products/SuperDeluxe.png' },

  { keywords: ['100', 'shot'], image: '/images/products/100 shot.webp' },
  { keywords: ['200', 'shot'], image: '/images/products/200 shot.webp' },
  { keywords: ['265', 'shot'], image: '/images/products/265 shot.webp' },
  { keywords: ['shot'], image: '/api/uploads/products/12 shots.jpg' },

  { keywords: ['sparkler'], image: '/api/uploads/products/electric sparkler.jpg' },

  { keywords: ['whistling', 'rocket'], image: '/images/products/whistling-rocket.png' },
  { keywords: ['two', 'sound', 'rocket'], image: '/images/products/2-sound-rocket.png' },
  { keywords: ['color', 'pearl', 'rocket'], image: '/images/products/color-pearl-rocket.png' },
  { keywords: ['musical', 'rocket'], image: '/images/products/lunik-rocket.png' },
  { keywords: ['rocket'], image: '/images/products/2-sound-rocket.png' },

  { keywords: ['whistling', 'chakkar'], image: '/images/products/whistling-chakkar.png' },
  { keywords: ['electric', 'chakkar'], image: '/images/products/electric-chakkar.png' },
  { keywords: ['plastic', 'chakkar'], image: '/images/products/deluxe-ground-chakkar.png' },
  { keywords: ['wire', 'chakkar'], image: '/images/products/electric-chakkar.png' },
  { keywords: ['ground', 'chakkar', 'big'], image: '/images/products/super-chakkar-big.png' },
  { keywords: ['ground', 'chakkar', 'deluxe'], image: '/images/products/deluxe-ground-chakkar.png' },
  { keywords: ['chakkar'], image: '/images/products/ground-chakkar.jpg' },

  { keywords: ['super', 'deluxe', 'flower', 'pot'], image: '/images/products/super-deluxe-flower-pot.png' },
  { keywords: ['crackling', 'flower', 'pot'], image: '/images/products/crackling-flower-pot.png' },
  { keywords: ['rainbow', 'flower', 'pot'], image: '/images/products/rainbow-flower-pot.png' },
  { keywords: ['large', 'flower', 'pot'], image: '/images/products/large-flower-pot.png' },
  { keywords: ['medium', 'flower', 'pot'], image: '/images/products/medium-flower-pot.png' },
  { keywords: ['small', 'flower', 'pot'], image: '/images/products/small-flower-pot.png' },
  { keywords: ['flower', 'pot'], image: '/images/products/flower-pots.png' }
];

const categoryRules = [
  { keywords: ['bomb'], image: '/api/uploads/products/AtomBomb.png' },
  { keywords: ['sky', 'shot'], image: '/api/uploads/products/SkyShotRocket.png' },
  { keywords: ['sparkler'], image: '/api/uploads/products/electric sparkler.jpg' },
  { keywords: ['rocket'], image: '/images/products/2-sound-rocket.png' },
  { keywords: ['chakkar'], image: '/images/products/ground-chakkar.jpg' },
  { keywords: ['flower', 'pot'], image: '/images/products/flower-pots.png' },
  { keywords: ['multicolour', 'shot'], image: '/images/products/100 shot.webp' },
  { keywords: ['fancy', 'fountain'], image: '/api/uploads/products/magicFountain.jpg' },
  { keywords: ['fancy', 'cracker'], image: '/api/uploads/products/SuperDeluxe.png' },
  { keywords: ['twinkling', 'star'], image: '/api/uploads/products/TwinklingStars.webp' }
];

const resolveMappedImage = (product) => {
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category || '';
  const searchText = `${product.name || ''} ${categoryName || ''}`.toLowerCase();

  for (const rule of keywordRules) {
    if (rule.keywords.every((k) => searchText.includes(k))) {
      return rule.image;
    }
  }

  const categoryText = String(categoryName).toLowerCase();
  for (const rule of categoryRules) {
    if (rule.keywords.every((k) => categoryText.includes(k))) {
      return rule.image;
    }
  }

  return null;
};

const main = async () => {
  await mongoose.connect(MONGO_URI);

  const products = await Product.find({ isActive: true }).populate('category', 'name').select('_id name category imageUrl');

  let totalUpdated = 0;
  let skyshotUpdated = 0;
  let sparklerUpdated = 0;
  const bulkOps = [];

  for (const product of products) {
    const mappedImage = resolveMappedImage(product);
    if (!mappedImage || mappedImage === product.imageUrl) continue;

    bulkOps.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { imageUrl: mappedImage } }
      }
    });

    const text = `${product.name || ''} ${product.category?.name || ''}`.toLowerCase();
    if (text.includes('sky') && text.includes('shot')) skyshotUpdated += 1;
    if (text.includes('sparkler')) sparklerUpdated += 1;
    totalUpdated += 1;
  }

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  console.log(JSON.stringify({
    scanned: products.length,
    totalUpdated,
    skyshotUpdated,
    sparklerUpdated
  }));

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
