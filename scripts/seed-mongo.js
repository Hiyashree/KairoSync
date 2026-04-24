/**
 * Seed MongoDB with demo users (admin, leader, employee).
 * Run: node scripts/seed-mongo.js
 * Make sure MONGODB_URI is set in .env and MongoDB is running.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement';

const demoUsers = [
    {
        name: 'Admin User',
        email: 'admin@graphura.in',
        password: 'admin123',
        role: 'admin',
        domain: ''
    },
    {
        name: 'Sarah Johnson',
        email: 'leader@gmail.com',
        password: 'leader123',
        role: 'leader',
        domain: 'Frontend'
    },
    {
        name: 'John Doe',
        email: 'employee@gmail.com',
        password: 'employee123',
        role: 'employee',
        domain: 'Frontend'
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const u of demoUsers) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                console.log(`User ${u.email} already exists, skipping.`);
            } else {
                await User.create(u);
                console.log(`Created: ${u.role} - ${u.email}`);
            }
        }

        console.log('Seed completed.');
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seed();
