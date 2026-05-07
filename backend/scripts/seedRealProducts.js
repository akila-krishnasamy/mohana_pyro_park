import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import InventoryLog from '../models/InventoryLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akilak23cse_db_user:hRKuM2xtjGW26HgW@cluster0.ododkjk.mongodb.net/mohana_pyro_park?retryWrites=true&w=majority&appName=Cluster0';

// Real categories from Mohana Pyro Park website
const categories = [
  { name: 'Sound Crackers', description: 'Traditional sound crackers including Lakshmi, Deluxe and Three Sound varieties', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400' },
  { name: 'Chakkarams', description: 'Ground chakras and spinning wheels for colorful ground displays', image: 'https://images.unsplash.com/photo-1604422282015-b226a7e4ef57?w=400' },
  { name: 'Flower Pots', description: 'Flower pot fountains with beautiful colorful sparks', image: 'https://images.unsplash.com/photo-1498931299839-881738d820da?w=400' },
  { name: 'Bomb Crackers', description: 'High sound bombs including Hydro, Pubg and Paper bombs', image: 'https://images.unsplash.com/photo-1481126557203-83efaa688ff8?w=400' },
  { name: 'Bijili Crackers', description: 'Classic Bijili crackers in Red and Gold variants', image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400' },
  { name: 'Pencil Crackers', description: 'Pencil crackers with waterfall effects', image: 'https://images.unsplash.com/photo-1530098776990-05fbbe6ff1fc?w=400' },
  { name: 'Fancy Fountains', description: 'Decorative fountains including Peacock, Butterfly and more', image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400' },
  { name: 'Rockets', description: 'Sky rockets with bomb sounds and colorful effects', image: 'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=400' },
  { name: 'Fancy Crackers', description: 'Premium fancy crackers in various series', image: 'https://images.unsplash.com/photo-1482330454287-2bff620d4568?w=400' },
  { name: 'Multicolour Shots', description: 'Multi-shot aerial fireworks with stunning displays', image: 'https://images.unsplash.com/photo-1498931299839-881738d820da?w=400' },
  { name: 'Sparklers', description: 'Electric, color, green and red sparklers in various sizes', image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400' },
  { name: 'Gift Packs', description: 'Family packs and gift boxes for complete celebrations', image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400' },
  { name: 'New Arrivals 2025', description: 'Latest products for 2025 festival season', image: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400' }
];

// Real products from Mohana Pyro Park website
const productsData = [
  // Sound Crackers
  { name: '3 ½" Lakshmi', code: '2', category: 'Sound Crackers', content: '1 PKT', actualPrice: 140, price: 14 },
  { name: '4" Lakshmi/Chotta', code: '3', category: 'Sound Crackers', content: '1 PKT', actualPrice: 180, price: 18 },
  { name: '4" Deluxe', code: '4', category: 'Sound Crackers', content: '1 PKT', actualPrice: 270, price: 27 },
  { name: '4" Gold Deluxe', code: '5', category: 'Sound Crackers', content: '1 PKT', actualPrice: 280, price: 28 },
  { name: '5" Lakshmi', code: '6', category: 'Sound Crackers', content: '1 PKT', actualPrice: 450, price: 45 },
  { name: 'Three Sound', code: '154', category: 'Sound Crackers', content: '1 PKT', actualPrice: 350, price: 35 },
  { name: '5" Mega Deluxe', code: '154A', category: 'Sound Crackers', content: '1 PKT', actualPrice: 550, price: 55 },

  // Chakkarams
  { name: 'Ground Chakkar Big', code: '15', category: 'Chakkarams', content: '1 BOX', actualPrice: 330, price: 33 },
  { name: 'Ground Chakkar Big 25 Pcs', code: '16', category: 'Chakkarams', content: '1 BOX', actualPrice: 700, price: 70 },
  { name: 'Ground Chakkar Special', code: '17', category: 'Chakkarams', content: '1 BOX', actualPrice: 650, price: 65 },
  { name: 'Ground Chakkar Deluxe', code: '18', category: 'Chakkarams', content: '1 BOX', actualPrice: 1100, price: 110 },
  { name: '4x4 Wheel', code: '20', category: 'Chakkarams', content: '1 BOX', actualPrice: 1750, price: 175 },
  { name: 'Chakkaram Plastic SPL', code: '20a', category: 'Chakkarams', content: '1 BOX', actualPrice: 1200, price: 120 },
  { name: 'Plastic Chakkaram DLX', code: '20b', category: 'Chakkarams', content: '1 BOX', actualPrice: 1800, price: 180 },

  // Flower Pots
  { name: 'Flower Pots Big', code: '26', category: 'Flower Pots', content: '1 BOX', actualPrice: 550, price: 55 },
  { name: 'Flower Pots Special', code: '27', category: 'Flower Pots', content: '1 BOX', actualPrice: 750, price: 75 },
  { name: 'Flower Pots Ashoka', code: '28', category: 'Flower Pots', content: '1 BOX', actualPrice: 980, price: 98 },
  { name: 'Flower Pots Colour Koti', code: '29', category: 'Flower Pots', content: '1 BOX', actualPrice: 1800, price: 180 },
  { name: 'Flower Pots Deluxe 5 Pcs', code: '30', category: 'Flower Pots', content: '1 BOX', actualPrice: 1500, price: 150 },
  { name: 'Colorkoti Mega DLX', code: '30A', category: 'Flower Pots', content: '1 BOX', actualPrice: 2800, price: 280 },

  // Bomb Crackers
  { name: 'Hydro Bomb', code: '54', category: 'Bomb Crackers', content: '1 BOX', actualPrice: 600, price: 60 },
  { name: 'PUBG Bomb', code: '56', category: 'Bomb Crackers', content: '1 BOX', actualPrice: 990, price: 99 },
  { name: 'Paper Bomb Small', code: '58', category: 'Bomb Crackers', content: '1 BOX', actualPrice: 500, price: 50 },
  { name: 'Paper Bomb Big', code: '59', category: 'Bomb Crackers', content: '1 BOX', actualPrice: 1000, price: 100 },
  { name: 'Jumbo Classic Bomb', code: '55A', category: 'Bomb Crackers', content: '1 BOX', actualPrice: 1200, price: 120 },
  { name: 'Mega Paper Bomb 1kg', code: '59A', category: 'Bomb Crackers', content: '1 BOX', actualPrice: 2000, price: 200 },

  // Bijili Crackers
  { name: 'Red Bijili (100 Pcs)', code: '11', category: 'Bijili Crackers', content: '1 PKT', actualPrice: 300, price: 30 },
  { name: 'Gold Bijili (100 Pcs)', code: '12', category: 'Bijili Crackers', content: '1 PKT', actualPrice: 360, price: 36 },

  // Pencil Crackers
  { name: 'Sivakasi SPL Pencil', code: '13', category: 'Pencil Crackers', content: '1 BOX', actualPrice: 1800, price: 180 },
  { name: 'Water Falls Pencil', code: '14', category: 'Pencil Crackers', content: '1 BOX', actualPrice: 1700, price: 170 },

  // Fancy Fountains
  { name: 'Peacock', code: '32', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1600, price: 160 },
  { name: 'Angry Bird 5 In 1', code: '33', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1450, price: 145 },
  { name: 'Dairy Milk 5 In 1', code: '34', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1800, price: 180 },
  { name: 'Siren', code: '36', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1700, price: 170 },
  { name: 'Tricolour Fountain', code: '40', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 2500, price: 250 },
  { name: 'Butterfly', code: '42', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1250, price: 125 },
  { name: 'Bambaram', code: '31A', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1000, price: 100 },
  { name: 'Mr. Wheel', code: '38E', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1950, price: 195 },
  { name: 'Green Garden with Crackling', code: '35I', category: 'Fancy Fountains', content: '1 BOX', actualPrice: 1600, price: 160 },

  // Continuous Crackers (under Sound Crackers)
  { name: '1K Wala', code: '7', category: 'Sound Crackers', content: '1 BOX', actualPrice: 3000, price: 300 },
  { name: '2K Wala', code: '8', category: 'Sound Crackers', content: '1 BOX', actualPrice: 6000, price: 600 },

  // Rockets
  { name: 'Rocket Bomb', code: '50', category: 'Rockets', content: '1 BOX', actualPrice: 650, price: 65 },
  { name: 'Two Sound Rocket', code: '52', category: 'Rockets', content: '1 BOX', actualPrice: 1200, price: 120 },
  { name: 'Musical Rocket', code: '190', category: 'Rockets', content: '1 BOX', actualPrice: 1500, price: 150 },

  // Fancy Crackers - Chotta Fancy
  { name: 'Chotta Fancy 1', code: '60', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 400, price: 40 },
  { name: 'Chotta Fancy 1-A', code: '61', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 400, price: 40 },

  // Fancy Crackers - Avenger Series
  { name: 'Super Man 2" Fancy', code: '67', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 1100, price: 110 },
  { name: 'Iron Man 2" Fancy', code: '68', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 1100, price: 110 },
  { name: 'Captain America 2" Fancy', code: '69', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 1100, price: 110 },

  // Fancy Crackers - 3 Pcs Series
  { name: 'Chola 3 Pcs Fancy', code: '70', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 2700, price: 270 },
  { name: 'Joy 3 Pcs Fancy', code: '71', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 2700, price: 270 },
  { name: 'Jazz 3 Pcs Fancy', code: '190D', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },
  { name: 'Elite 3 Pcs Fancy', code: '190E', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },

  // Fancy Crackers - Festival Series
  { name: 'Chathurti', code: '76', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },
  { name: 'Dusshera', code: '77', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },
  { name: 'Raksha Bandan', code: '78', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },
  { name: 'Onam', code: '79', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },
  { name: 'Navarathri', code: '80', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },
  { name: 'Diwali', code: '81', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3950, price: 395 },

  // Fancy Crackers - Disney Series
  { name: 'Aladin Double Ball', code: '82', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4500, price: 450 },
  { name: 'Rock', code: '83', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4500, price: 450 },
  { name: 'Duck', code: '84', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4500, price: 450 },
  { name: 'Lion', code: '85', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4500, price: 450 },

  // Fancy Crackers - Gambling Series
  { name: 'Spin (3 Color With Crackling)', code: '88', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 9500, price: 950 },
  { name: 'Dice (3 Color With Crackling)', code: '89', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 9500, price: 950 },
  { name: 'Jackpot (3 Color With Crackling)', code: '90', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 9500, price: 950 },
  { name: 'Casino (3 Color With Crackling)', code: '91', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 9500, price: 950 },

  // Fancy Crackers - Wedding Series
  { name: 'Haldi', code: '92', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4850, price: 485 },
  { name: 'Sagai', code: '93', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4850, price: 485 },
  { name: 'Shaadi', code: '94', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4850, price: 485 },
  { name: 'Mehandi', code: '95', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 4850, price: 485 },

  // Fancy Crackers - Sky Series
  { name: 'Purple Snow (Purple Color)', code: '95a', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 10500, price: 1050 },
  { name: 'Blue Thunder (Blue Color)', code: '95B', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 10500, price: 1050 },
  { name: 'Orange Lighting (Orange Color)', code: '95C', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 10500, price: 1050 },
  { name: 'Lava Rain', code: '95D', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 10500, price: 1050 },

  // Fancy Crackers - Incredible India Series
  { name: 'Mahapalipuram', code: '190I', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3500, price: 350 },
  { name: 'Tajmahal', code: '190j', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3500, price: 350 },
  { name: 'Gate of India', code: '190K', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3500, price: 350 },
  { name: 'Ellora', code: '190L', category: 'Fancy Crackers', content: '1 BOX', actualPrice: 3500, price: 350 },

  // Multicolour Shots
  { name: 'Penda Multishot 5 In 1', code: '96', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 1850, price: 185 },
  { name: '7 Shots', code: '97', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 900, price: 90 },
  { name: '12 Shots', code: '98', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 1850, price: 185 },
  { name: '16 Shot Peacock Show', code: '100', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 5580, price: 558 },
  { name: '30 Shot Peacock Show', code: '101', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 8660, price: 866 },
  { name: '30 Shots Premium', code: '102', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 4000, price: 400 },
  { name: '30 Shots Crackling Spanka Brand', code: '103', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 5900, price: 590 },
  { name: '60 Shots Premium', code: '104', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 8000, price: 800 },
  { name: '120 Shots', code: '106', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 16000, price: 1600 },
  { name: '240 Shots', code: '107', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 30000, price: 3000 },
  { name: 'Lights of Thunder IPL Shots', code: '195q', category: 'Multicolour Shots', content: '1 BOX', actualPrice: 38000, price: 3800 },

  // Sparklers
  { name: '7cm Electric Sparklers', code: '108', category: 'Sparklers', content: '1 Bundle', actualPrice: 800, price: 80 },
  { name: '7cm Colour Sparklers', code: '109', category: 'Sparklers', content: '1 Bundle', actualPrice: 900, price: 90 },
  { name: '7cm Green Sparklers', code: '110', category: 'Sparklers', content: '1 Bundle', actualPrice: 1000, price: 100 },
  { name: '7cm Red Sparklers', code: '111', category: 'Sparklers', content: '1 Bundle', actualPrice: 1100, price: 110 },
  { name: '10cm Electric Sparklers', code: '112', category: 'Sparklers', content: '1 BOX', actualPrice: 180, price: 18 },
  { name: '10cm Colour Sparklers', code: '113', category: 'Sparklers', content: '1 BOX', actualPrice: 220, price: 22 },
  { name: '10cm Green Sparklers', code: '114', category: 'Sparklers', content: '1 BOX', actualPrice: 260, price: 26 },
  { name: '10cm Red Sparklers', code: '115', category: 'Sparklers', content: '1 BOX', actualPrice: 280, price: 28 },
  { name: '15cm Electric Sparklers', code: '116', category: 'Sparklers', content: '1 BOX', actualPrice: 450, price: 45 },
  { name: '15cm Colour Sparklers', code: '117', category: 'Sparklers', content: '1 BOX', actualPrice: 520, price: 52 },
  { name: '15cm Green Sparklers', code: '118', category: 'Sparklers', content: '1 BOX', actualPrice: 550, price: 55 },
  { name: '15cm Red Sparklers', code: '119', category: 'Sparklers', content: '1 BOX', actualPrice: 580, price: 58 },
  { name: '30cm Electric Sparklers', code: '120', category: 'Sparklers', content: '1 BOX', actualPrice: 450, price: 45 },
  { name: '30cm Colour Sparklers', code: '121', category: 'Sparklers', content: '1 BOX', actualPrice: 520, price: 52 },
  { name: '30cm Green Sparklers', code: '122', category: 'Sparklers', content: '1 BOX', actualPrice: 550, price: 55 },
  { name: '30cm Red Sparklers', code: '123', category: 'Sparklers', content: '1 BOX', actualPrice: 580, price: 58 },
  { name: '50cm Electric Sparklers', code: '124', category: 'Sparklers', content: '1 BOX', actualPrice: 1500, price: 150 },
  { name: '50cm Colour Sparklers', code: '125', category: 'Sparklers', content: '1 BOX', actualPrice: 1700, price: 170 },
  { name: 'Rotating Sparklers', code: '183', category: 'Sparklers', content: '1 BOX', actualPrice: 2000, price: 200 },
  { name: 'Spinning Sparklers', code: '195n', category: 'Sparklers', content: '1 BOX', actualPrice: 2000, price: 200 },

  // Twinkling Star
  { name: '1 1/2 Twinkling Star', code: '12A', category: 'Sparklers', content: '1 BOX', actualPrice: 250, price: 25 },
  { name: '4 Twinkling Star', code: '12B', category: 'Sparklers', content: '1 BOX', actualPrice: 600, price: 60 },
  { name: 'Kit Kat', code: '12C', category: 'Sparklers', content: '1 BOX', actualPrice: 250, price: 25 },

  // Colour Matches & Others
  { name: 'Roll Cap', code: '126', category: 'Sparklers', content: '1 BOX', actualPrice: 850, price: 85 },
  { name: '10 In 1 Giant', code: '129', category: 'Sparklers', content: '1 BOX', actualPrice: 1400, price: 140 },
  { name: 'Serpand Egg Big 1 Unit', code: '130', category: 'Sparklers', content: '1 BOX', actualPrice: 300, price: 30 },
  { name: 'MIB Gun With Caps', code: '161', category: 'Sparklers', content: '1 BOX', actualPrice: 1500, price: 150 },

  // Gift Packs
  { name: 'Gold Family Pack', code: '200', category: 'Gift Packs', content: '1 BOX', actualPrice: 4000, price: 4000 },
  { name: 'Diamond Family Pack', code: '201', category: 'Gift Packs', content: '1 BOX', actualPrice: 8000, price: 8000 },

  // New Arrivals 2025
  { name: '90 Watts', code: '167', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1500, price: 150 },
  { name: 'Color Smoke', code: '186', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1700, price: 170 },
  { name: 'Color Garden Aerial 3 Color', code: '187', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 2500, price: 250 },
  { name: 'Dora Singer', code: '190N', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1500, price: 150 },
  { name: 'MRF Bat Ball', code: '190S', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 2500, price: 250 },
  { name: 'Pada Peacock', code: '190w', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 4300, price: 430 },
  { name: 'Guitar', code: '191b', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 3000, price: 300 },
  { name: 'Big Fish Pencil', code: '191c', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1400, price: 140 },
  { name: 'Hanuman Kadayutham', code: '191d', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 2600, price: 260 },
  { name: 'Drone', code: '191e', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1700, price: 170 },
  { name: 'Lion King', code: '190G', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 2000, price: 200 },
  { name: 'Water Queen', code: '190h', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1700, price: 170 },
  { name: 'Money Heist Magic Show', code: '195f', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 2000, price: 200 },
  { name: 'Sword', code: '195g', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1800, price: 180 },
  { name: 'Smoke Stick Yellow', code: '195H', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 750, price: 75 },
  { name: 'Smoke Stick Green', code: '195J', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 750, price: 75 },
  { name: 'Smoke Stick Fancy', code: '195k', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 750, price: 75 },
  { name: 'Smoke Stick Blue', code: '195L', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 750, price: 75 },
  { name: 'Disco Shower', code: '195m', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1100, price: 110 },
  { name: 'Wire Chakkaram', code: '195o', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 2000, price: 200 },
  { name: 'Balloda Tin Fountain', code: '195p', category: 'New Arrivals 2025', content: '1 BOX', actualPrice: 1200, price: 120 }
];

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomDate(startDate, endDate) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

// Product images based on category
const categoryImages = {
  'Sound Crackers': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400'
  ],
  'Chakkarams': [
    'https://images.unsplash.com/photo-1604422282015-b226a7e4ef57?w=400',
    'https://images.unsplash.com/photo-1530098776990-05fbbe6ff1fc?w=400'
  ],
  'Flower Pots': [
    'https://images.unsplash.com/photo-1498931299839-881738d820da?w=400',
    'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400'
  ],
  'Bomb Crackers': [
    'https://images.unsplash.com/photo-1481126557203-83efaa688ff8?w=400',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'
  ],
  'Bijili Crackers': [
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400',
    'https://images.unsplash.com/photo-1530098776990-05fbbe6ff1fc?w=400'
  ],
  'Pencil Crackers': [
    'https://images.unsplash.com/photo-1530098776990-05fbbe6ff1fc?w=400',
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400'
  ],
  'Fancy Fountains': [
    'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400',
    'https://images.unsplash.com/photo-1498931299839-881738d820da?w=400'
  ],
  'Rockets': [
    'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?w=400',
    'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400'
  ],
  'Fancy Crackers': [
    'https://images.unsplash.com/photo-1482330454287-2bff620d4568?w=400',
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400'
  ],
  'Multicolour Shots': [
    'https://images.unsplash.com/photo-1498931299839-881738d820da?w=400',
    'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400'
  ],
  'Sparklers': [
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400',
    'https://images.unsplash.com/photo-1530098776990-05fbbe6ff1fc?w=400'
  ],
  'Gift Packs': [
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400',
    'https://images.unsplash.com/photo-1482330454287-2bff620d4568?w=400'
  ],
  'New Arrivals 2025': [
    'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400',
    'https://images.unsplash.com/photo-1498931299839-881738d820da?w=400'
  ]
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({}),
      InventoryLog.deleteMany({})
    ]);

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create users
    console.log('Creating users...');
    const users = [
      { name: 'Owner User', email: 'owner@mohanapyro.com', password: 'password123', phone: '9600428362', role: 'owner' },
      { name: 'Manager User', email: 'manager@mohanapyro.com', password: 'password123', phone: '9876543211', role: 'manager' },
      { name: 'Staff User', email: 'staff@mohanapyro.com', password: 'password123', phone: '9876543212', role: 'staff' },
      { name: 'Rajesh Kumar', email: 'rajesh@gmail.com', password: 'password123', phone: '9876543213', role: 'customer' },
      { name: 'Priya Sharma', email: 'priya@gmail.com', password: 'password123', phone: '9876543214', role: 'customer' },
      { name: 'Amit Patel', email: 'amit@gmail.com', password: 'password123', phone: '9876543215', role: 'customer' },
      { name: 'Sunita Devi', email: 'sunita@gmail.com', password: 'password123', phone: '9876543216', role: 'customer' },
      { name: 'Vikram Singh', email: 'vikram@gmail.com', password: 'password123', phone: '9876543217', role: 'customer' },
      { name: 'Meena Kumari', email: 'meena@gmail.com', password: 'password123', phone: '9876543218', role: 'customer' },
      { name: 'Arjun Reddy', email: 'arjun@gmail.com', password: 'password123', phone: '9876543219', role: 'customer' },
      { name: 'Lakshmi Narayanan', email: 'lakshmi@gmail.com', password: 'password123', phone: '9876543220', role: 'customer' },
      { name: 'Deepak Verma', email: 'deepak@gmail.com', password: 'password123', phone: '9876543221', role: 'customer' },
      { name: 'Ananya Das', email: 'ananya@gmail.com', password: 'password123', phone: '9876543222', role: 'customer' },
      { name: 'Customer User', email: 'customer@mohanapyro.com', password: 'password123', phone: '9876543223', role: 'customer' }
    ];
    const createdUsers = await User.create(users);
    const customerUsers = createdUsers.filter(u => u.role === 'customer');
    const staffUsers = createdUsers.filter(u => ['staff', 'manager', 'owner'].includes(u.role));

    // Create products with real data
    console.log('Creating products with real data from Mohana Pyro Park...');
    
    // Map content strings to valid unit enum values
    const unitMap = {
      '1 PKT': 'pack',
      '1 BOX': 'box',
      '1 Bundle': 'pack',
      '1 Pkt': 'pack',
      '1 Box': 'box',
      '1 box': 'box'
    };
    
    // Map categories to safety types
    const safetyTypeMap = {
      'Sound Crackers': 'high-noise',
      'Chakkarams': 'moderate',
      'Flower Pots': 'safe',
      'Bomb Crackers': 'high-noise',
      'Bijili Crackers': 'high-noise',
      'Pencil Crackers': 'moderate',
      'Fancy Fountains': 'safe',
      'Rockets': 'high-noise',
      'Fancy Crackers': 'moderate',
      'Multicolour Shots': 'professional',
      'Sparklers': 'safe',
      'Gift Packs': 'moderate',
      'New Arrivals 2025': 'moderate'
    };
    
    const products = productsData.map(p => ({
      name: p.name,
      description: `Premium ${p.name} from Mohana Pyro Park, Sivakasi. ${p.content} per unit. Original price ₹${p.actualPrice} (90% Discount). Product Code: ${p.code}`,
      category: categoryMap[p.category],
      price: p.price,
      discountPrice: null,
      unit: unitMap[p.content] || 'box',
      itemsPerUnit: randomInt(1, 25),
      stock: randomInt(20, 200),
      lowStockThreshold: randomInt(5, 20),
      safetyType: safetyTypeMap[p.category] || 'moderate',
      ageRecommendation: p.category === 'Sparklers' ? 'all-ages' : (p.category === 'Multicolour Shots' ? '18+' : '12+'),
      imageUrl: (categoryImages[p.category] || ['https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400'])[0],
      tags: [p.category.toLowerCase().replace(' ', '-'), 'sivakasi', 'diwali', 'crackers'],
      isFestivalSpecial: Math.random() > 0.5,
      festivalTags: ['diwali', 'new-year'],
      isActive: true,
      totalSold: randomInt(0, 500)
    }));

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    // Generate orders for the past 2 years with festival spikes
    console.log('Generating orders for analytics...');
    const orders = [];
    const inventoryLogs = [];
    
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const endDate = new Date();

    // Festival periods (approximate dates for higher order volume)
    const festivals = [
      { name: 'Diwali', month: 10, dayRange: [20, 30], context: 'diwali' },
      { name: 'Dussehra', month: 9, dayRange: [10, 20], context: 'diwali' },
      { name: 'Ganesh Chaturthi', month: 8, dayRange: [1, 15], context: 'normal' },
      { name: 'Pongal', month: 0, dayRange: [13, 17], context: 'pongal' },
      { name: 'Vishu', month: 3, dayRange: [13, 16], context: 'normal' },
      { name: 'Onam', month: 7, dayRange: [20, 30], context: 'normal' },
      { name: 'Christmas/New Year', month: 11, dayRange: [20, 31], context: 'new-year' }
    ];

    const statuses = ['pending', 'confirmed', 'packing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
    const statusWeights = [0.03, 0.03, 0.03, 0.03, 0.08, 0.75, 0.05];
    
    function getWeightedStatus() {
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < statuses.length; i++) {
        cumulative += statusWeights[i];
        if (rand < cumulative) return statuses[i];
      }
      return 'delivered';
    }

    function isFestivalPeriod(date) {
      const month = date.getMonth();
      const day = date.getDate();
      for (const festival of festivals) {
        if (month === festival.month && day >= festival.dayRange[0] && day <= festival.dayRange[1]) {
          return { isFestival: true, name: festival.name, context: festival.context };
        }
      }
      return { isFestival: false, context: 'normal' };
    }

    // Generate orders
    let orderNumber = 1000;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const festivalInfo = isFestivalPeriod(currentDate);
      const baseOrdersPerDay = festivalInfo.isFestival ? randomInt(15, 40) : randomInt(1, 8);
      
      for (let i = 0; i < baseOrdersPerDay; i++) {
        const customer = customerUsers[randomInt(0, customerUsers.length - 1)];
        const numItems = randomInt(1, 6);
        const items = [];
        let subtotal = 0;

        const shuffledProducts = [...createdProducts].sort(() => Math.random() - 0.5);
        for (let j = 0; j < numItems; j++) {
          const product = shuffledProducts[j];
          const quantity = randomInt(1, 5);
          const totalPrice = product.price * quantity;
          subtotal += totalPrice;
          
          items.push({
            product: product._id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            totalPrice
          });
        }

        const discount = Math.random() > 0.7 ? randomInt(50, 500) : 0;
        const deliveryType = Math.random() > 0.3 ? 'delivery' : 'pickup';
        const deliveryCharge = deliveryType === 'delivery' ? (subtotal > 2000 ? 0 : 100) : 0;
        const totalAmount = subtotal - discount + deliveryCharge;

        const status = getWeightedStatus();
        const orderDate = new Date(currentDate);
        orderDate.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));

        const order = {
          orderNumber: `MPP${orderNumber++}`,
          customer: customer._id,
          items,
          subtotal,
          discount,
          deliveryCharge,
          totalAmount,
          deliveryType,
          status,
          paymentMethod: ['cash', 'upi', 'card', 'online'][randomInt(0, 3)],
          paymentStatus: status === 'delivered' || status === 'picked-up' ? 'paid' : (status === 'cancelled' ? 'refunded' : 'pending'),
          customerNotes: festivalInfo.isFestival ? `${festivalInfo.name} order` : '',
          festivalContext: festivalInfo.context,
          createdAt: orderDate,
          updatedAt: orderDate,
          statusTimeline: [{
            status: 'pending',
            timestamp: orderDate,
            notes: 'Order placed'
          }]
        };

        // Add delivery address for delivery orders
        if (deliveryType === 'delivery') {
          order.deliveryAddress = {
            street: `${randomInt(1, 500)}, ${['Main Road', 'Cross Street', 'Temple Road', 'Market Street', 'Gandhi Nagar'][randomInt(0, 4)]}`,
            city: ['Chennai', 'Madurai', 'Coimbatore', 'Trichy', 'Salem', 'Sivakasi'][randomInt(0, 5)],
            state: 'Tamil Nadu',
            pincode: `6${randomInt(10000, 99999)}`,
            landmark: ['Near Bus Stop', 'Opposite Temple', 'Behind School', 'Next to Hospital', ''][randomInt(0, 4)]
          };
        } else {
          // Pickup order
          const pickupDate = new Date(orderDate);
          pickupDate.setDate(pickupDate.getDate() + randomInt(1, 3));
          order.pickupDate = pickupDate;
          order.pickupTimeSlot = ['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'][randomInt(0, 3)];
        }

        if (status === 'delivered' || status === 'picked-up') {
          const deliveryDate = new Date(orderDate);
          deliveryDate.setDate(deliveryDate.getDate() + randomInt(2, 5));
          order.deliveredAt = deliveryDate;
          
          // Add status timeline entries
          const confirmDate = new Date(orderDate);
          confirmDate.setHours(confirmDate.getHours() + randomInt(1, 4));
          order.confirmedAt = confirmDate;
          order.statusTimeline.push({ status: 'confirmed', timestamp: confirmDate, notes: 'Order confirmed' });
          
          const packDate = new Date(confirmDate);
          packDate.setHours(packDate.getHours() + randomInt(2, 6));
          order.packedAt = packDate;
          order.statusTimeline.push({ status: 'packing', timestamp: packDate, notes: 'Order being packed' });
          
          const readyDate = new Date(packDate);
          readyDate.setHours(readyDate.getHours() + randomInt(1, 3));
          order.readyAt = readyDate;
          order.statusTimeline.push({ status: 'ready', timestamp: readyDate, notes: 'Order ready' });
          
          order.statusTimeline.push({ status: status, timestamp: deliveryDate, notes: status === 'delivered' ? 'Order delivered' : 'Order picked up' });
        }

        orders.push(order);

        // Create inventory logs for delivered/picked-up orders
        if (status === 'delivered' || status === 'picked-up') {
          for (const item of items) {
            inventoryLogs.push({
              product: item.product,
              type: 'sale',
              quantity: -item.quantity,
              previousStock: randomInt(50, 200),
              newStock: randomInt(20, 150),
              reference: `Order ${order.orderNumber}`,
              performedBy: staffUsers[randomInt(0, staffUsers.length - 1)]._id,
              createdAt: orderDate
            });
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Insert orders in batches
    console.log(`Inserting ${orders.length} orders...`);
    const batchSize = 500;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      await Order.insertMany(batch);
      console.log(`Inserted orders ${i + 1} to ${Math.min(i + batchSize, orders.length)}`);
    }

    // Insert inventory logs in batches
    console.log(`Inserting ${inventoryLogs.length} inventory logs...`);
    for (let i = 0; i < inventoryLogs.length; i += batchSize) {
      const batch = inventoryLogs.slice(i, i + batchSize);
      await InventoryLog.insertMany(batch);
    }

    // Add some stock replenishment logs
    console.log('Adding stock replenishment logs...');
    for (const product of createdProducts) {
      const numReplenishments = randomInt(3, 8);
      for (let i = 0; i < numReplenishments; i++) {
        const logDate = getRandomDate(startDate, endDate);
        const quantity = randomInt(50, 200);
        inventoryLogs.push({
          product: product._id,
          type: 'restock',
          quantity,
          previousStock: randomInt(10, 50),
          newStock: randomInt(100, 250),
          reference: `PO-${randomInt(10000, 99999)}`,
          performedBy: staffUsers[randomInt(0, staffUsers.length - 1)]._id,
          createdAt: logDate
        });
      }
    }

    await InventoryLog.insertMany(inventoryLogs.slice(-createdProducts.length * 8));

    console.log('\n✅ Database seeded successfully with REAL Mohana Pyro Park products!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Inventory Logs: ${inventoryLogs.length}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Owner:    owner@mohanapyro.com / password123');
    console.log('   Manager:  manager@mohanapyro.com / password123');
    console.log('   Staff:    staff@mohanapyro.com / password123');
    console.log('   Customer: customer@mohanapyro.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
