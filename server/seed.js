const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/modules/auth/models/User');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI not set in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const defaultUsers = [
      {
        fullName: 'Manager User',
        email: 'manager@ldad.com',
        password: 'Secret123!',
        role: 'Manager',
      },
      {
        fullName: 'Coordinator User',
        email: 'coordinator@ldad.com',
        password: 'Secret123!',
        role: 'Coordinator',
      },
      {
        fullName: 'Analyst User',
        email: 'analyst@ldad.com',
        password: 'Secret123!',
        role: 'Analyst',
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        existingUser.password = userData.password;
        existingUser.role = userData.role;
        existingUser.fullName = userData.fullName;
        await existingUser.save();
        console.log(`Updated user: ${userData.email} (${userData.role})`);
        continue;
      }

      const user = await User.create(userData);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
