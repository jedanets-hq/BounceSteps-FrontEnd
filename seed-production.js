/**
 * PRODUCTION DATABASE SEEDER
 * 
 * This script seeds the production database on Render with test data.
 * Run this ONCE after deploying to Render to populate the database.
 * 
 * Usage:
 *   node seed-production.js
 * 
 * Make sure DATABASE_URL environment variable is set on Render!
 */

require('dotenv').config();
const { pool } = require('./config/postgresql');

const testServices = [
  // Tours & Activities
  {
    title: 'Serengeti Safari Tour',
    description: 'Experience the great migration and witness the Big Five in their natural habitat. Professional guides, comfortable vehicles, and unforgettable memories.',
    category: 'Tours & Activities',
    subcategory: 'Safari',
    price: 500000,
    currency: 'TZS',
    duration: 72,
    max_participants: 6,
    location: 'Serengeti National Park',
    country: 'Tanzania',
    region: 'Mara',
    district: 'Serengeti',
    area: 'Serengeti',
    images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801'],
    amenities: ['Professional Guide', 'Transport', 'Meals', 'Camping Equipment']
  },
  {
    title: 'Kilimanjaro Trek Adventure',
    description: 'Conquer Africa\'s highest peak with experienced guides. Multiple route options available.',
    category: 'Tours & Activities',
    subcategory: 'Trekking',
    price: 1500000,
    currency: 'TZS',
    duration: 168,
    max_participants: 8,
    location: 'Kilimanjaro',
    country: 'Tanzania',
    region: 'Kilimanjaro',
    district: 'Moshi Rural',
    area: 'Machame',
    images: ['https://images.unsplash.com/photo-1589182373726-e4f658ab50f0'],
    amenities: ['Expert Guides', 'Camping Gear', 'Meals', 'Porters']
  },
  {
    title: 'Ngorongoro Crater Day Trip',
    description: 'Explore the world\'s largest inactive volcanic caldera and see diverse wildlife.',
    category: 'Tours & Activities',
    subcategory: 'Safari',
    price: 350000,
    currency: 'TZS',
    duration: 10,
    max_participants: 6,
    location: 'Ngorongoro Crater',
    country: 'Tanzania',
    region: 'Arusha',
    district: 'Ngorongoro',
    area: 'Ngorongoro Crater',
    images: ['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e'],
    amenities: ['Guide', 'Transport', 'Lunch', 'Park Fees']
  },
  {
    title: 'Maasai Village Cultural Tour',
    description: 'Immerse yourself in Maasai culture, traditions, and daily life.',
    category: 'Tours & Activities',
    subcategory: 'Cultural',
    price: 75000,
    currency: 'TZS',
    duration: 4,
    max_participants: 12,
    location: 'Arusha Central',
    country: 'Tanzania',
    region: 'Arusha',
    district: 'Arusha City',
    area: 'Arusha Central',
    images: ['https://images.unsplash.com/photo-1523805009345-7448845a9e53'],
    amenities: ['Cultural Guide', 'Transport', 'Traditional Dance', 'Craft Shopping']
  },
  
  // Accommodation
  {
    title: 'Arusha Serena Hotel',
    description: 'Luxury hotel in the heart of Arusha with stunning views and world-class amenities.',
    category: 'Accommodation',
    subcategory: 'Hotel',
    price: 450000,
    currency: 'TZS',
    duration: 24,
    max_participants: 2,
    location: 'Arusha Central',
    country: 'Tanzania',
    region: 'Arusha',
    district: 'Arusha City',
    area: 'Arusha Central',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
    amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa', 'Gym', 'Bar']
  },
  {
    title: 'Zanzibar Beach Resort',
    description: 'Beachfront paradise with crystal clear waters and white sandy beaches.',
    category: 'Accommodation',
    subcategory: 'Resort',
    price: 650000,
    currency: 'TZS',
    duration: 24,
    max_participants: 2,
    location: 'Zanzibar',
    country: 'Tanzania',
    region: 'Zanzibar',
    district: 'Zanzibar City',
    area: 'Stone Town',
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
    amenities: ['Beach Access', 'Pool', 'Restaurant', 'Water Sports', 'Spa']
  },
  {
    title: 'Moshi Backpackers Hostel',
    description: 'Budget-friendly accommodation perfect for trekkers and backpackers.',
    category: 'Accommodation',
    subcategory: 'Hostel',
    price: 45000,
   