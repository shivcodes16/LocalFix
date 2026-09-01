const isMapsConfigured = Boolean(process.env.GOOGLE_MAPS_API_KEY);

/**
 * Haversine formula: distance in km between two [lng, lat] points.
 * Used as the always-available fallback so search/discovery works even
 * without a Google Maps API key (MongoDB's $near also uses this math
 * internally for 2dsphere indexes, but this helper is for display purposes,
 * e.g. showing "3.2 km away" on a technician card).
 */
const distanceKm = ([lng1, lat1], [lng2, lat2]) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

module.exports = { distanceKm, isMapsConfigured };
