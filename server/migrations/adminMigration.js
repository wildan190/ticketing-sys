import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import TicketCategory from '../models/TicketCategory.js';
import Setting from '../models/Setting.js';
import Animal from '../models/Animal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrate = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB...');

    // 1. Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@zoo.com' });
    if (!adminExists) {
      await User.create({
        name: 'Zoo Admin',
        email: 'admin@zoo.com',
        password: 'admin123@password', // This will be hashed by pre-save middleware
        role: 'admin',
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

    // 2. Seed Ticket Categories if they don't exist
    const categoriesCount = await TicketCategory.countDocuments();
    if (categoriesCount === 0) {
      await TicketCategory.insertMany([
        { name: 'Dewasa', price: 50000 },
        { name: 'Anak-anak', price: 25000 },
        { name: 'Mancanegara', price: 150000 },
      ]);
      console.log('Ticket categories seeded.');
    }

    // 3. Initialize Settings if they don't exist
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      await Setting.create({
        daily_quota: 1000,
        midtrans_is_production: false,
      });
      console.log('Default settings initialized.');
    }

    // 4. Seed Animals if they don't exist
    const animalsCount = await Animal.countDocuments();
    if (animalsCount === 0) {
      await Animal.insertMany([
        {
          name: 'Singa Afrika',
          species: 'Panthera leo',
          description: 'Singa adalah spesies hewan dari keluarga Felidae atau jenis kucing. Singa merupakan hewan yang hidup berkelompok.',
          image_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          feeding_times: [{ day: 'Setiap Hari', time: '10:00' }, { day: 'Setiap Hari', time: '15:00' }],
          location: { latitude: -6.123, longitude: 106.123 }
        },
        {
          name: 'Gajah Sumatera',
          species: 'Elephas maximus sumatranus',
          description: 'Gajah sumatera adalah subspesies dari gajah asia yang hanya berhabitat di pulau Sumatera.',
          image_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          feeding_times: [{ day: 'Setiap Hari', time: '09:00' }, { day: 'Setiap Hari', time: '14:00' }],
          location: { latitude: -6.124, longitude: 106.124 }
        },
        {
          name: 'Harimau Benggala',
          species: 'Panthera tigris tigris',
          description: 'Harimau benggala adalah subspesies harimau yang paling banyak jumlahnya di dunia.',
          image_url: 'https://images.unsplash.com/photo-1501705388883-4ed8a543392c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          feeding_times: [{ day: 'Setiap Hari', time: '11:00' }, { day: 'Setiap Hari', time: '16:00' }],
          location: { latitude: -6.125, longitude: 106.125 }
        }
      ]);
      console.log('Animals seeded.');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
