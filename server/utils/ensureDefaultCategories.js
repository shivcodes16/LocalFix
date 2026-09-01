const ServiceCategory = require('../models/ServiceCategory');
const DEFAULT_CATEGORIES = require('../config/defaultCategories');

/**
 * Ensures the ServiceCategory collection is never empty.
 *
 * This is what actually populates the category dropdowns on the Technician
 * Profile, New Service Request, and Service Passport pages — all three read
 * from the same GET /api/categories endpoint. Previously categories only
 * existed if `npm run seed` had been run manually, so a fresh/empty database
 * left every one of those dropdowns with no options.
 *
 * Idempotent and safe to call repeatedly (on server startup AND, as a
 * self-healing fallback, from inside the /api/categories request handler
 * itself): it only inserts the default list when the collection is
 * completely empty at the moment it's called, and never touches, duplicates,
 * or overwrites existing categories (including ones created via the seed
 * script or the admin API).
 *
 * Logs every step explicitly so it's obvious from the server console whether
 * this ran, what it found, and what it did.
 *
 * @returns {Promise<number>} the number of categories that exist after this runs
 */
const ensureDefaultCategories = async () => {
  console.log('[LocalFix] ensureDefaultCategories: checking service category count…');

  let count;
  try {
    count = await ServiceCategory.countDocuments();
  } catch (error) {
    console.error('[LocalFix] ensureDefaultCategories: failed to count categories:', error.stack || error.message);
    throw error;
  }

  console.log(`[LocalFix] ensureDefaultCategories: found ${count} existing categor${count === 1 ? 'y' : 'ies'}.`);

  if (count > 0) {
    console.log('[LocalFix] ensureDefaultCategories: categories already exist, skipping insert.');
    return count;
  }

  console.log(`[LocalFix] ensureDefaultCategories: inserting ${DEFAULT_CATEGORIES.length} default categories…`);
  try {
    const inserted = await ServiceCategory.insertMany(DEFAULT_CATEGORIES, { ordered: true });
    console.log(
      `[LocalFix] ensureDefaultCategories: successfully created ${inserted.length} default categories ` +
        `(${inserted.map((c) => c.name).join(', ')}).`
    );
    return inserted.length;
  } catch (error) {
    console.error('[LocalFix] ensureDefaultCategories: insertMany failed:', error.stack || error.message);
    throw error;
  }
};

module.exports = ensureDefaultCategories;
