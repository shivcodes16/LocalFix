/**
 * Seed script for LocalFix.
 * Usage:
 *   npm run seed           -> wipes relevant collections and inserts demo data
 *   npm run seed:destroy   -> wipes relevant collections only
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const TechnicianProfile = require('../models/TechnicianProfile');
const ServiceRequest = require('../models/ServiceRequest');
const Quote = require('../models/Quote');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ServicePassportItem = require('../models/ServicePassportItem');
const Notification = require('../models/Notification');
const CATEGORY_SEED = require('../config/defaultCategories');

const destroy = async () => {
  await Promise.all([
    Notification.deleteMany(),
    Review.deleteMany(),
    ServicePassportItem.deleteMany(),
    Booking.deleteMany(),
    Quote.deleteMany(),
    ServiceRequest.deleteMany(),
    TechnicianProfile.deleteMany(),
    ServiceCategory.deleteMany(),
    User.deleteMany({ email: { $regex: /@localfix\.demo$/ } }),
  ]);
  console.log('Demo data destroyed.');
};

const seed = async () => {
  await destroy();

  // --- Categories ---
  const categories = await ServiceCategory.insertMany(CATEGORY_SEED);
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));
  console.log(`Seeded ${categories.length} categories.`);

  // --- Users: customers ---
  const jaipurCoords = [75.7873, 26.9124]; // [lng, lat]
  const customers = await User.create([
    {
      name: 'Aarav Mehta',
      email: 'aarav@localfix.demo',
      password: 'password123',
      phone: '9990001111',
      role: 'customer',
      location: { coordinates: jaipurCoords, address: 'C-Scheme', city: 'Jaipur' },
    },
    {
      name: 'Priya Sharma',
      email: 'priya@localfix.demo',
      password: 'password123',
      phone: '9990002222',
      role: 'customer',
      location: { coordinates: [75.8, 26.92], address: 'Malviya Nagar', city: 'Jaipur' },
    },
  ]);
  console.log(`Seeded ${customers.length} customers.`);

  // --- Users: technicians ---
  const techUsersData = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.electrician@localfix.demo',
      phone: '9998887771',
      categories: ['Electrical'],
      headline: 'Licensed electrician, 8+ years, same-day fixes',
      bio: 'Specializing in home wiring, switchboard upgrades, and short-circuit troubleshooting across Jaipur.',
      years: 8,
      pricing: { visitCharge: 100, minPrice: 200, maxPrice: 3000 },
      areas: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar'],
      coords: [75.79, 26.915],
    },
    {
      name: 'Suresh Patel',
      email: 'suresh.ac@localfix.demo',
      phone: '9998887772',
      categories: ['AC Repair'],
      headline: 'AC specialist — split, window & central units',
      bio: 'Certified AC technician handling installation, gas refills, and annual maintenance contracts.',
      years: 6,
      pricing: { visitCharge: 150, minPrice: 300, maxPrice: 5000 },
      areas: ['C-Scheme', 'Raja Park'],
      coords: [75.795, 26.91],
    },
    {
      name: 'Mohit Verma',
      email: 'mohit.plumber@localfix.demo',
      phone: '9998887773',
      categories: ['Plumbing'],
      headline: 'Reliable plumber for leaks, fittings & renovations',
      bio: 'Ten years fixing pipes, taps and bathroom fittings for homes and small offices.',
      years: 10,
      pricing: { visitCharge: 80, minPrice: 150, maxPrice: 4000 },
      areas: ['Malviya Nagar', 'Jagatpura'],
      coords: [75.81, 26.85],
    },
    {
      name: 'Deepak Singh',
      email: 'deepak.appliance@localfix.demo',
      phone: '9998887774',
      categories: ['Appliance Repair'],
      headline: 'Appliance repair — fridge, washing machine, microwave',
      bio: 'Factory-trained on major appliance brands with genuine spare parts sourcing.',
      years: 5,
      pricing: { visitCharge: 100, minPrice: 250, maxPrice: 4500 },
      areas: ['Vaishali Nagar', 'C-Scheme'],
      coords: [75.775, 26.91],
    },
    {
      name: 'Amit Joshi',
      email: 'amit.laptop@localfix.demo',
      phone: '9998887775',
      categories: ['Laptop Repair', 'Mobile Repair'],
      headline: 'Laptop & mobile repair, doorstep diagnosis',
      bio: 'Hardware and software repairs for laptops and phones — screens, batteries, boot issues.',
      years: 4,
      pricing: { visitCharge: 0, minPrice: 200, maxPrice: 6000 },
      areas: ['Raja Park', 'C-Scheme'],
      coords: [75.8, 26.905],
    },
    {
      name: 'Vikram Yadav',
      email: 'vikram.carpenter@localfix.demo',
      phone: '9998887776',
      categories: ['Carpentry', 'Painting'],
      headline: 'Carpentry & painting — furniture, doors, touch-ups',
      bio: 'From squeaky hinges to full-room painting, handled with care and clean finishing.',
      years: 12,
      pricing: { visitCharge: 100, minPrice: 300, maxPrice: 8000 },
      areas: ['Jagatpura', 'Malviya Nagar'],
      coords: [75.815, 26.845],
    },
  ];

  const techniciansWithProfiles = [];
  for (const t of techUsersData) {
    const user = await User.create({
      name: t.name,
      email: t.email,
      password: 'password123',
      phone: t.phone,
      role: 'technician',
      location: { coordinates: t.coords, address: t.areas[0], city: 'Jaipur' },
    });

    const profile = await TechnicianProfile.create({
      user: user._id,
      headline: t.headline,
      bio: t.bio,
      categories: t.categories.map((c) => catByName[c]._id),
      yearsOfExperience: t.years,
      pricing: { ...t.pricing, currency: 'INR' },
      serviceAreas: t.areas,
      serviceRadiusKm: 15,
      isAcceptingRequests: true,
      availability: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => ({
        day,
        startTime: '09:00',
        endTime: '19:00',
        isAvailable: true,
      })),
      verification: { idVerified: true, documentsSubmitted: true },
    });

    techniciansWithProfiles.push({ user, profile, categories: t.categories });
  }
  console.log(`Seeded ${techniciansWithProfiles.length} technicians with profiles.`);

  // --- Admin account ---
  await User.create({
    name: 'LocalFix Admin',
    email: 'admin@localfix.demo',
    password: 'password123',
    role: 'admin',
  });

  // --- Demo service passport item for Aarav ---
  const acPassport = await ServicePassportItem.create({
    customer: customers[0]._id,
    productName: 'LG Split AC 1.5 Ton',
    category: catByName['AC Repair']._id,
    brand: 'LG',
    purchaseDate: new Date('2022-04-10'),
    notes: 'Installed in the living room.',
  });

  // --- Demo flow #1: fully completed & verified booking with review ---
  const acTech = techniciansWithProfiles.find((t) => t.categories.includes('AC Repair'));
  const request1 = await ServiceRequest.create({
    customer: customers[0]._id,
    category: catByName['AC Repair']._id,
    subcategory: 'Cooling issue',
    title: 'AC running but room not cooling',
    description: 'My split AC turns on and the fan runs, but the room is not cooling down at all. Please check gas and compressor.',
    location: { coordinates: jaipurCoords, address: 'C-Scheme', city: 'Jaipur' },
    aiSuggestion: {
      suggestedCategory: 'AC Repair',
      suggestedSubcategory: 'Cooling issue',
      confidence: 0.55,
      source: 'fallback',
    },
    servicePassportItem: acPassport._id,
    status: 'booked',
  });

  const quote1 = await Quote.create({
    serviceRequest: request1._id,
    technician: acTech.user._id,
    estimatedPrice: 1200,
    visitCharge: 150,
    estimatedArrival: 'Same day, 4-6 PM',
    message: 'Sounds like a gas leak or dirty coil. I can inspect and refill gas if needed.',
    status: 'accepted',
  });

  const booking1 = await Booking.create({
    serviceRequest: request1._id,
    quote: quote1._id,
    customer: customers[0]._id,
    technician: acTech.user._id,
    category: catByName['AC Repair']._id,
    agreedPrice: 1200,
    finalPrice: 1200,
    servicePassportItem: acPassport._id,
    status: 'verified',
    isVerified: true,
    isReviewed: true,
    technicianCompletedAt: new Date(Date.now() - 2 * 86400000),
    customerConfirmedAt: new Date(Date.now() - 2 * 86400000 + 3600000),
    warrantyPeriodDays: 30,
    statusHistory: [
      { status: 'pending_start', changedAt: new Date(Date.now() - 3 * 86400000) },
      { status: 'in_progress', changedAt: new Date(Date.now() - 3 * 86400000 + 3600000) },
      { status: 'completed_by_technician', changedAt: new Date(Date.now() - 2 * 86400000) },
      { status: 'verified', changedAt: new Date(Date.now() - 2 * 86400000 + 3600000) },
    ],
    serviceNotes: [
      {
        text: 'Inspected the unit — found a small gas leak at the indoor unit valve. Sealed the leak, refilled R32 gas to correct pressure, cleaned the filter and outdoor coil. Tested cooling for 20 minutes, unit now reaching set temperature.',
        aiSummary: 'Fixed a gas leak, refilled gas, and cleaned the unit. Cooling confirmed working.',
        addedAt: new Date(Date.now() - 2 * 86400000),
      },
    ],
  });

  await Review.create({
    booking: booking1._id,
    customer: customers[0]._id,
    technician: acTech.user._id,
    rating: 5,
    comment: 'Fixed the cooling issue quickly and explained everything clearly. Highly recommend!',
    punctualityRating: 5,
    qualityRating: 5,
    isVerifiedJob: true,
  });

  acPassport.history.push({
    booking: booking1._id,
    technician: acTech.user._id,
    serviceType: 'Gas refill + cleaning',
    date: new Date(Date.now() - 2 * 86400000),
    cost: 1200,
    notes: 'Sealed gas leak, refilled gas, cleaned filter and coil.',
    warrantyExpiresAt: new Date(Date.now() + 28 * 86400000),
  });
  await acPassport.save();

  acTech.profile.stats.completedJobs = 14;
  acTech.profile.stats.verifiedJobs = 12;
  acTech.profile.stats.averageRating = 4.8;
  acTech.profile.stats.reviewCount = 10;
  acTech.profile.stats.repeatCustomerCount = 3;
  await acTech.profile.save();

  // Give the other technicians some baseline trust stats too, so search/sort looks realistic.
  const baselineStats = [
    { completedJobs: 22, verifiedJobs: 19, averageRating: 4.7, reviewCount: 16, repeatCustomerCount: 5 },
    { completedJobs: 30, verifiedJobs: 27, averageRating: 4.6, reviewCount: 21, repeatCustomerCount: 8 },
    { completedJobs: 9, verifiedJobs: 7, averageRating: 4.4, reviewCount: 6, repeatCustomerCount: 1 },
    { completedJobs: 17, verifiedJobs: 15, averageRating: 4.9, reviewCount: 13, repeatCustomerCount: 4 },
  ];
  const remainingTechs = techniciansWithProfiles.filter((t) => t.user._id.toString() !== acTech.user._id.toString());
  for (let i = 0; i < remainingTechs.length; i += 1) {
    const stats = baselineStats[i % baselineStats.length];
    remainingTechs[i].profile.stats = { ...remainingTechs[i].profile.stats.toObject(), ...stats };
    await remainingTechs[i].profile.save();
  }

  // --- Demo flow #2: open request with two competing quotes awaiting decision ---
  const electTech = techniciansWithProfiles.find((t) => t.categories.includes('Electrical'));
  const request2 = await ServiceRequest.create({
    customer: customers[1]._id,
    category: catByName['Electrical']._id,
    subcategory: 'Wiring / Switches',
    title: 'Switchboard sparking in kitchen',
    description: 'One of the switches in my kitchen switchboard sparks a little when turned on. Needs urgent inspection.',
    location: { coordinates: [75.8, 26.92], address: 'Malviya Nagar', city: 'Jaipur' },
    status: 'quoted',
  });

  await Quote.create({
    serviceRequest: request2._id,
    technician: electTech.user._id,
    estimatedPrice: 350,
    visitCharge: 100,
    estimatedArrival: 'Tomorrow, 10-12 AM',
    message: 'This is likely a loose connection or worn switch. I can replace the switch and check the wiring for ₹350.',
  });

  // --- Demo flow #3: booking in progress ---
  const plumberTech = techniciansWithProfiles.find((t) => t.categories.includes('Plumbing'));
  const request3 = await ServiceRequest.create({
    customer: customers[0]._id,
    category: catByName['Plumbing']._id,
    subcategory: 'Leak / Pipe issue',
    title: 'Bathroom tap leaking continuously',
    description: 'The bathroom wash-basin tap has been dripping non-stop for two days.',
    location: { coordinates: jaipurCoords, address: 'C-Scheme', city: 'Jaipur' },
    status: 'booked',
  });

  const quote3 = await Quote.create({
    serviceRequest: request3._id,
    technician: plumberTech.user._id,
    estimatedPrice: 250,
    visitCharge: 80,
    estimatedArrival: 'Today, 5-7 PM',
    message: 'Sounds like a worn washer. Quick fix, ₹250 including parts.',
    status: 'accepted',
  });

  await Booking.create({
    serviceRequest: request3._id,
    quote: quote3._id,
    customer: customers[0]._id,
    technician: plumberTech.user._id,
    category: catByName['Plumbing']._id,
    agreedPrice: 250,
    finalPrice: 250,
    status: 'in_progress',
    statusHistory: [
      { status: 'pending_start', changedAt: new Date(Date.now() - 3600000) },
      { status: 'in_progress', changedAt: new Date() },
    ],
  });

  console.log('Demo data seeded successfully.');
  console.log('\nDemo accounts (all passwords: password123):');
  console.log('  Customer: aarav@localfix.demo');
  console.log('  Customer: priya@localfix.demo');
  console.log('  Technician (AC): suresh.ac@localfix.demo');
  console.log('  Technician (Electrical): rajesh.electrician@localfix.demo');
  console.log('  Technician (Plumbing): mohit.plumber@localfix.demo');
  console.log('  Admin: admin@localfix.demo');
};

const run = async () => {
  await connectDB();
  if (process.argv.includes('--destroy')) {
    await destroy();
  } else {
    await seed();
  }
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
