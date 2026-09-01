/**
 * Single source of truth for LocalFix's default service categories.
 *
 * Used by:
 *  - server/utils/ensureDefaultCategories.js (auto-bootstraps these on server
 *    startup if the ServiceCategory collection is empty, so category dropdowns
 *    across the app are never empty even if the demo seed script was never run)
 *  - server/seed/seed.js (the demo data seeder imports the same list instead
 *    of duplicating it)
 */
const DEFAULT_CATEGORIES = [
  { name: 'AC Repair', icon: 'Snowflake', subcategories: ['Gas refill', 'Cooling issue', 'Installation', 'Servicing'] },
  { name: 'Plumbing', icon: 'Wrench', subcategories: ['Leak / Pipe issue', 'Bathroom fitting', 'Drain cleaning'] },
  { name: 'Electrical', icon: 'Zap', subcategories: ['Wiring / Switches', 'Fan/Light install', 'Short circuit'] },
  { name: 'Appliance Repair', icon: 'Refrigerator', subcategories: ['Refrigerator', 'Washing Machine', 'Microwave'] },
  { name: 'Laptop Repair', icon: 'Laptop', subcategories: ['Hardware issue', 'Screen replacement', 'OS/Software'] },
  { name: 'Mobile Repair', icon: 'Smartphone', subcategories: ['Screen / Charging', 'Battery', 'Software'] },
  { name: 'Carpentry', icon: 'Hammer', subcategories: ['Furniture / Fittings', 'Door repair', 'Custom work'] },
  { name: 'Painting', icon: 'PaintRoller', subcategories: ['Wall repair', 'Full home painting', 'Touch-up'] },
  { name: 'Pest Control', icon: 'Bug', subcategories: ['General pest control', 'Termite treatment'] },
];

module.exports = DEFAULT_CATEGORIES;
