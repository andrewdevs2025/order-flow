/**
 * Haversine distance calculation service
 * Calculates the great-circle distance between two points on Earth
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Find the best master for an order based on distance, rating, and current load
 * @param {Array} masters - Array of master objects
 * @param {number} orderLat - Order latitude
 * @param {number} orderLon - Order longitude
 * @param {number} maxDistance - Maximum distance in kilometers (default: 50)
 * @returns {Object|null} Best master or null if none found
 */
export function findBestMaster(masters, orderLat, orderLon, maxDistance = 50) {
  if (!masters || masters.length === 0) {
    return null;
  }

  // Filter masters within max distance and calculate scores
  const eligibleMasters = masters
    .map(master => {
      const distance = calculateDistance(
        orderLat, orderLon, 
        master.latitude, master.longitude
      );
      
      // Skip if too far
      if (distance > maxDistance) {
        return null;
      }

      // Calculate composite score
      // Distance weight: 70%, Rating weight: 20%, Load weight: 10%
      const distanceScore = Math.max(0, (maxDistance - distance) / maxDistance) * 0.7;
      const ratingScore = (master.rating / 5) * 0.2; // Normalize rating to 0-1
      const loadScore = Math.max(0, (10 - master.active_orders) / 10) * 0.1; // Assume max 10 orders
      
      const totalScore = distanceScore + ratingScore + loadScore;
      
      return {
        ...master,
        distance,
        score: totalScore
      };
    })
    .filter(master => master !== null)
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return eligibleMasters.length > 0 ? eligibleMasters[0] : null;
}
