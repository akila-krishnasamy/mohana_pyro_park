import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import InventoryLog from '../models/InventoryLog.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mohana_pyro_park');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// ============================================
// REALISTIC DATA DEFINITIONS
// ============================================

const categories = [
  { name: 'Ground Chakkar', description: 'Spinning ground fireworks', displayOrder: 1 },
  { name: 'Flower Pots', description: 'Colorful fountain fireworks', displayOrder: 2 },
  { name: 'Rockets', description: 'Sky-shooting rockets with effects', displayOrder: 3 },
  { name: 'Bombs & Crackers', description: 'Sound crackers and bombs', displayOrder: 4 },
  { name: 'Sparklers', description: 'Hand-held sparklers and pens', displayOrder: 5 },
  { name: 'Fancy Items', description: 'Multi-effect fancy fireworks', displayOrder: 6 },
  { name: 'Gift Boxes', description: 'Combo gift packs', displayOrder: 7 },
  { name: 'Sky Shots', description: 'Aerial multi-shot fireworks', displayOrder: 8 }
];

// Realistic cracker products with actual names
const products = [
  // Ground Chakkar
  { name: 'Super Chakkar Big', category: 'Ground Chakkar', price: 120, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Deluxe Ground Chakkar', category: 'Ground Chakkar', price: 180, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali'] },
  { name: 'Electric Chakkar', category: 'Ground Chakkar', price: 250, unit: 'box', itemsPerUnit: 5, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },
  { name: 'Whistling Chakkar', category: 'Ground Chakkar', price: 150, unit: 'box', itemsPerUnit: 10, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali', 'new-year'] },

  // Flower Pots
  { name: 'Small Flower Pot', category: 'Flower Pots', price: 80, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Medium Flower Pot', category: 'Flower Pots', price: 150, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Large Flower Pot', category: 'Flower Pots', price: 300, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: '8+', festivalTags: ['diwali'] },
  { name: 'Super Deluxe Flower Pot', category: 'Flower Pots', price: 500, unit: 'piece', itemsPerUnit: 1, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },
  { name: 'Rainbow Flower Pot', category: 'Flower Pots', price: 200, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Crackling Flower Pot', category: 'Flower Pots', price: 350, unit: 'piece', itemsPerUnit: 1, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },

  // Rockets
  { name: '2 Sound Rocket', category: 'Rockets', price: 100, unit: 'box', itemsPerUnit: 5, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali', 'new-year'] },
  { name: 'Whistling Rocket', category: 'Rockets', price: 120, unit: 'box', itemsPerUnit: 5, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },
  { name: 'Lunik Rocket', category: 'Rockets', price: 180, unit: 'box', itemsPerUnit: 5, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },
  { name: 'Sky Shot Rocket', category: 'Rockets', price: 250, unit: 'box', itemsPerUnit: 3, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali', 'new-year'] },
  { name: 'Color Pearl Rocket', category: 'Rockets', price: 200, unit: 'box', itemsPerUnit: 5, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },

  // Bombs & Crackers
  { name: 'Kuruvi', category: 'Bombs & Crackers', price: 50, unit: 'box', itemsPerUnit: 50, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Laxmi Cracker', category: 'Bombs & Crackers', price: 80, unit: 'box', itemsPerUnit: 50, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali'] },
  { name: 'Red Bijili', category: 'Bombs & Crackers', price: 100, unit: 'box', itemsPerUnit: 100, safetyType: 'safe', ageRecommendation: '8+', festivalTags: ['diwali', 'general'] },
  { name: 'Atom Bomb', category: 'Bombs & Crackers', price: 150, unit: 'box', itemsPerUnit: 10, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali'] },
  { name: 'Hydrogen Bomb', category: 'Bombs & Crackers', price: 200, unit: 'box', itemsPerUnit: 5, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali'] },
  { name: 'Classic Crackers 1000 Wala', category: 'Bombs & Crackers', price: 800, unit: 'piece', itemsPerUnit: 1, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali', 'wedding'] },
  { name: 'Classic Crackers 5000 Wala', category: 'Bombs & Crackers', price: 3500, unit: 'piece', itemsPerUnit: 1, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali', 'wedding'] },

  // Sparklers
  { name: '10cm Sparklers', category: 'Sparklers', price: 30, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: '15cm Sparklers', category: 'Sparklers', price: 50, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: '30cm Sparklers', category: 'Sparklers', price: 80, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Electric Sparklers', category: 'Sparklers', price: 100, unit: 'box', itemsPerUnit: 5, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'new-year', 'wedding'] },
  { name: 'Color Sparklers', category: 'Sparklers', price: 60, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Pencil Sparklers', category: 'Sparklers', price: 40, unit: 'box', itemsPerUnit: 10, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },

  // Fancy Items
  { name: 'Twinkling Star', category: 'Fancy Items', price: 350, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: '8+', festivalTags: ['diwali'] },
  { name: 'Magic Fountain', category: 'Fancy Items', price: 450, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: '8+', festivalTags: ['diwali', 'new-year'] },
  { name: 'Golden Shower', category: 'Fancy Items', price: 280, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: '8+', festivalTags: ['diwali'] },
  { name: 'Dancing Butterfly', category: 'Fancy Items', price: 200, unit: 'box', itemsPerUnit: 5, safetyType: 'safe', ageRecommendation: 'all-ages', festivalTags: ['diwali', 'general'] },
  { name: 'Peacock Wheel', category: 'Fancy Items', price: 500, unit: 'piece', itemsPerUnit: 1, safetyType: 'moderate', ageRecommendation: '12+', festivalTags: ['diwali'] },
  { name: 'Multicolor Fountain', category: 'Fancy Items', price: 380, unit: 'piece', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: '8+', festivalTags: ['diwali', 'new-year'] },

  // Gift Boxes
  { name: 'Family Pack Small', category: 'Gift Boxes', price: 1500, unit: 'box', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: 'all-ages', isFestivalSpecial: true, festivalTags: ['diwali'] },
  { name: 'Family Pack Medium', category: 'Gift Boxes', price: 3000, unit: 'box', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: 'all-ages', isFestivalSpecial: true, festivalTags: ['diwali'] },
  { name: 'Family Pack Large', category: 'Gift Boxes', price: 5000, unit: 'box', itemsPerUnit: 1, safetyType: 'moderate', ageRecommendation: '8+', isFestivalSpecial: true, festivalTags: ['diwali'] },
  { name: 'Premium Gift Box', category: 'Gift Boxes', price: 8000, unit: 'box', itemsPerUnit: 1, safetyType: 'moderate', ageRecommendation: '12+', isFestivalSpecial: true, festivalTags: ['diwali'] },
  { name: 'Kids Special Pack', category: 'Gift Boxes', price: 1000, unit: 'box', itemsPerUnit: 1, safetyType: 'safe', ageRecommendation: 'all-ages', isFestivalSpecial: true, festivalTags: ['diwali', 'general'] },
  { name: 'New Year Special Pack', category: 'Gift Boxes', price: 2500, unit: 'box', itemsPerUnit: 1, safetyType: 'moderate', ageRecommendation: '12+', isFestivalSpecial: true, festivalTags: ['new-year'] },

  // Sky Shots
  { name: '12 Shot Color', category: 'Sky Shots', price: 600, unit: 'piece', itemsPerUnit: 1, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali', 'new-year'] },
  { name: '25 Shot Fancy', category: 'Sky Shots', price: 1200, unit: 'piece', itemsPerUnit: 1, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali'] },
  { name: '50 Shot Premium', category: 'Sky Shots', price: 2500, unit: 'piece', itemsPerUnit: 1, safetyType: 'professional', ageRecommendation: '18+', festivalTags: ['diwali', 'wedding'] },
  { name: '100 Shot Grand', category: 'Sky Shots', price: 5000, unit: 'piece', itemsPerUnit: 1, safetyType: 'professional', ageRecommendation: '18+', festivalTags: ['diwali', 'wedding'] },
  { name: 'Crackling Comet 30 Shot', category: 'Sky Shots', price: 1800, unit: 'piece', itemsPerUnit: 1, safetyType: 'high-noise', ageRecommendation: '18+', festivalTags: ['diwali', 'new-year'] }
];

// Tamil Nadu cities for realistic addresses
const tamilNaduCities = [
  'Sivakasi', 'Madurai', 'Coimbatore', 'Trichy', 'Salem', 'Erode',
  'Tirunelveli', 'Thoothukudi', 'Virudhunagar', 'Dindigul', 'Karur',
  'Thanjavur', 'Vellore', 'Tiruppur', 'Nagercoil', 'Kanyakumari'
];

const streetNames = [
  'Gandhi Road', 'Nehru Street', 'Main Bazaar', 'Temple Road', 'Market Street',
  'Raja Street', 'College Road', 'Hospital Road', 'Bus Stand Road', 'Railway Station Road',
  'Anna Nagar', 'MG Road', 'Kamaraj Street', 'Periyar Road', 'Subramanian Street'
];

// Realistic Tamil names
const firstNames = [
  'Murugan', 'Senthil', 'Kumar', 'Rajan', 'Selvam', 'Prakash', 'Velu', 'Kannan',
  'Lakshmi', 'Priya', 'Kavitha', 'Meena', 'Saranya', 'Divya', 'Anitha', 'Sangeetha',
  'Arun', 'Vijay', 'Karthik', 'Suresh', 'Ramesh', 'Ganesh', 'Manoj', 'Rajesh'
];

const lastNames = [
  'Nadar', 'Pillai', 'Thevar', 'Gounder', 'Mudaliar', 'Chettiar', 'Iyer', 'Iyengar',
  'Naidu', 'Rajan', 'Krishnan', 'Subramanian', 'Natarajan', 'Venkatesh', 'Sundaram'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '89', '88'];
  return randomChoice(prefixes) + String(randomInt(10000000, 99999999));
}

function generateAddress() {
  return {
    street: `${randomInt(1, 200)}, ${randomChoice(streetNames)}`,
    city: randomChoice(tamilNaduCities),
    state: 'Tamil Nadu',
    pincode: String(randomInt(600001, 641699))
  };
}

// Determine festival context based on date
function getFestivalContext(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Diwali season (October 15 - November 15)
  if ((month === 10 && day >= 15) || (month === 11 && day <= 15)) {
    return 'diwali';
  }
  // New Year (December 20 - January 5)
  if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
    return 'new-year';
  }
  // Pongal (January 13-16)
  if (month === 1 && day >= 13 && day <= 16) {
    return 'pongal';
  }
  return 'normal';
}

// Get sales multiplier based on festival
function getSalesMultiplier(festivalContext) {
  switch (festivalContext) {
    case 'diwali': return randomInt(8, 15); // 8-15x normal sales during Diwali
    case 'new-year': return randomInt(3, 6); // 3-6x during New Year
    case 'pongal': return randomInt(2, 4); // 2-4x during Pongal
    default: return 1;
  }
}

// ============================================
// MAIN SEEDING FUNCTION
// ============================================

async function seedDatabase() {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      InventoryLog.deleteMany({})
    ]);

    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log('👥 Creating users...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create staff users
    const staffUsers = [
      { name: 'Mohana Owner', email: 'owner@mohanapyro.com', phone: '9876543210', role: 'owner' },
      { name: 'Rajan Manager', email: 'manager@mohanapyro.com', phone: '9876543211', role: 'manager' },
      { name: 'Senthil Staff', email: 'staff1@mohanapyro.com', phone: '9876543212', role: 'staff' },
      { name: 'Kumar Staff', email: 'staff2@mohanapyro.com', phone: '9876543213', role: 'staff' }
    ];

    const createdStaff = await User.insertMany(
      staffUsers.map(user => ({
        ...user,
        password: hashedPassword,
        address: generateAddress(),
        isActive: true
      }))
    );

    // Create 100 customer users
    const customerUsers = [];
    for (let i = 0; i < 100; i++) {
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      customerUsers.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}${i}@email.com`,
        password: hashedPassword,
        phone: generatePhone(),
        role: 'customer',
        address: generateAddress(),
        isActive: true
      });
    }

    const createdCustomers = await User.insertMany(customerUsers);
    console.log(`   ✓ Created ${createdStaff.length} staff and ${createdCustomers.length} customers`);

    // ============================================
    // 2. CREATE CATEGORIES
    // ============================================
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    console.log(`   ✓ Created ${createdCategories.length} categories`);

    // ============================================
    // 3. CREATE PRODUCTS
    // ============================================
    console.log('🎆 Creating products...');
    const productDocs = products.map(product => ({
      ...product,
      category: categoryMap[product.category],
      stock: randomInt(50, 500),
      lowStockThreshold: product.price > 1000 ? 5 : 20,
      description: `High quality ${product.name} from Sivakasi. Perfect for celebrations.`,
      imageUrl: `/images/products/${product.name.toLowerCase().replace(/ /g, '-')}.png`,
      tags: [product.category.toLowerCase(), 'sivakasi', 'premium'],
      totalSold: 0,
      isActive: true
    }));

    const createdProducts = await Product.insertMany(productDocs);
    console.log(`   ✓ Created ${createdProducts.length} products`);

    // ============================================
    // 4. GENERATE 2 YEARS OF ORDERS
    // ============================================
    console.log('📦 Generating 2 years of realistic order data...');

    const allOrders = [];
    const inventoryLogs = [];
    const productStockTracker = {};
    createdProducts.forEach(p => {
      productStockTracker[p._id.toString()] = p.stock + 10000; // Add buffer for historical orders
    });

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const endDate = new Date();

    let orderCount = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const festivalContext = getFestivalContext(currentDate);
      const multiplier = getSalesMultiplier(festivalContext);

      // Base orders per day: 3-8 on normal days
      const baseOrders = randomInt(3, 8);
      const ordersToday = Math.min(baseOrders * multiplier, 50); // Cap at 50 orders/day

      for (let i = 0; i < ordersToday; i++) {
        const customer = randomChoice(createdCustomers);
        const deliveryType = Math.random() > 0.4 ? 'pickup' : 'delivery';

        // Select 1-8 products for the order
        const numProducts = festivalContext === 'diwali' ? randomInt(3, 8) : randomInt(1, 5);
        const orderProducts = [];
        const selectedProductIds = new Set();

        for (let j = 0; j < numProducts; j++) {
          let product;
          // Ensure unique products in order
          do {
            product = randomChoice(createdProducts);
          } while (selectedProductIds.has(product._id.toString()));

          selectedProductIds.add(product._id.toString());
          const quantity = randomInt(1, festivalContext === 'diwali' ? 10 : 5);
          const unitPrice = product.discountPrice || product.price;

          orderProducts.push({
            product: product._id,
            productName: product.name,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity
          });
        }

        const subtotal = orderProducts.reduce((sum, item) => sum + item.totalPrice, 0);
        const deliveryCharge = deliveryType === 'delivery' ? 50 : 0;
        const totalAmount = subtotal + deliveryCharge;

        // Generate order timestamp within the day
        const orderTime = new Date(currentDate);
        orderTime.setHours(randomInt(8, 21), randomInt(0, 59), randomInt(0, 59));

        // Determine order status based on date
        const daysSinceOrder = Math.floor((endDate - orderTime) / (1000 * 60 * 60 * 24));
        let status, deliveredAt;

        if (daysSinceOrder > 2) {
          // Old orders are completed
          status = deliveryType === 'delivery' ? 'delivered' : 'picked-up';
          deliveredAt = new Date(orderTime);
          deliveredAt.setHours(deliveredAt.getHours() + randomInt(2, 48));
        } else if (daysSinceOrder > 0) {
          // Recent orders may be in progress
          const statusOptions = ['pending', 'confirmed', 'packing', 'ready', 
            deliveryType === 'delivery' ? 'out-for-delivery' : 'ready'];
          status = randomChoice(statusOptions);
        } else {
          // Today's orders
          status = randomChoice(['pending', 'confirmed', 'packing']);
        }

        // Occasionally cancel orders (5%)
        if (Math.random() < 0.05 && daysSinceOrder > 1) {
          status = 'cancelled';
        }

        const year = orderTime.getFullYear().toString().slice(-2);
        const month = (orderTime.getMonth() + 1).toString().padStart(2, '0');
        const day = orderTime.getDate().toString().padStart(2, '0');
        orderCount++;
        const orderNumber = `MPP${year}${month}${day}${orderCount.toString().padStart(4, '0')}`;

        allOrders.push({
          orderNumber,
          customer: customer._id,
          items: orderProducts,
          subtotal,
          deliveryCharge,
          totalAmount,
          deliveryType,
          deliveryAddress: deliveryType === 'delivery' ? customer.address : undefined,
          status,
          statusTimeline: [
            { status: 'pending', timestamp: orderTime, notes: 'Order placed' },
            ...(status !== 'pending' ? [{ status: 'confirmed', timestamp: new Date(orderTime.getTime() + 30 * 60000) }] : []),
            ...(status === 'delivered' || status === 'picked-up' ? [{ status, timestamp: deliveredAt }] : [])
          ],
          festivalContext,
          paymentMethod: randomChoice(['cash', 'upi', 'cash', 'cash']),
          paymentStatus: status === 'cancelled' ? 'refunded' : (status === 'delivered' || status === 'picked-up' ? 'paid' : 'pending'),
          createdAt: orderTime,
          updatedAt: orderTime,
          deliveredAt: (status === 'delivered' || status === 'picked-up') ? deliveredAt : undefined,
          confirmedAt: status !== 'pending' ? new Date(orderTime.getTime() + 30 * 60000) : undefined
        });

        // Update product sold counts (only for completed orders)
        if (status !== 'cancelled') {
          orderProducts.forEach(item => {
            const productId = item.product.toString();
            productStockTracker[productId] -= item.quantity;
          });
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert orders in batches
    console.log(`   Inserting ${allOrders.length} orders...`);
    const batchSize = 1000;
    for (let i = 0; i < allOrders.length; i += batchSize) {
      const batch = allOrders.slice(i, i + batchSize);
      await Order.insertMany(batch, { ordered: false });
      process.stdout.write(`   Progress: ${Math.min(i + batchSize, allOrders.length)}/${allOrders.length}\r`);
    }
    console.log(`\n   ✓ Created ${allOrders.length} orders`);

    // ============================================
    // 5. UPDATE PRODUCT TOTAL SOLD
    // ============================================
    console.log('📊 Updating product statistics...');
    
    const productSalesAgg = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' }
        }
      }
    ]);

    for (const sale of productSalesAgg) {
      await Product.findByIdAndUpdate(sale._id, { totalSold: sale.totalSold });
    }
    console.log('   ✓ Updated product sales statistics');

    // ============================================
    // 6. CREATE SAMPLE INVENTORY LOGS
    // ============================================
    console.log('📝 Creating inventory logs...');
    
    const manager = createdStaff.find(s => s.role === 'manager');
    
    for (const product of createdProducts) {
      // Initial stock entry
      inventoryLogs.push({
        product: product._id,
        type: 'restock',
        quantity: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'Initial inventory',
        performedBy: manager._id,
        supplier: 'Sivakasi Fireworks Co.',
        createdAt: startDate
      });

      // Random restocks over the period
      const restockCount = randomInt(5, 15);
      for (let i = 0; i < restockCount; i++) {
        const restockDate = new Date(startDate.getTime() + Math.random() * (endDate - startDate));
        const quantity = randomInt(50, 300);
        inventoryLogs.push({
          product: product._id,
          type: 'restock',
          quantity,
          previousStock: randomInt(10, 100),
          newStock: randomInt(100, 500),
          reason: 'Regular replenishment',
          performedBy: manager._id,
          supplier: randomChoice(['Sivakasi Fireworks Co.', 'Standard Fireworks', 'Coronation Fireworks']),
          unitCost: Math.round(product.price * 0.6),
          createdAt: restockDate
        });
      }
    }

    await InventoryLog.insertMany(inventoryLogs);
    console.log(`   ✓ Created ${inventoryLogs.length} inventory logs`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdStaff.length + createdCustomers.length}`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Orders: ${allOrders.length}`);
    console.log(`   - Inventory Logs: ${inventoryLogs.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Owner:   owner@mohanapyro.com / password123');
    console.log('   Manager: manager@mohanapyro.com / password123');
    console.log('   Staff:   staff1@mohanapyro.com / password123');
    console.log('   Customer: murugan0@email.com / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed.');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
