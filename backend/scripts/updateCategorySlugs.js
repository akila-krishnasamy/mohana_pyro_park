import mongoose from 'mongoose';
import Category from '../models/Category.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akilak23cse_db_user:hRKuM2xtjGW26HgW@cluster0.ododkjk.mongodb.net/mohana_pyro_park?retryWrites=true&w=majority&appName=Cluster0';

async function updateCategorySlugs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories`);

    for (const category of categories) {
      // Generate slug from name
      const slug = category.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Update directly in DB to trigger slug generation
      await Category.updateOne(
        { _id: category._id },
        { $set: { slug: slug } }
      );
      console.log(`Updated "${category.name}" with slug: "${slug}"`);
    }

    // Show results
    const updatedCategories = await Category.find({}, 'name slug').lean();
    console.log('\nUpdated categories:');
    updatedCategories.forEach(c => {
      console.log(`  ${c.name}: ${c.slug}`);
    });

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateCategorySlugs();
