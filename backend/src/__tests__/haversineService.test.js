import { calculateDistance, findBestMaster, toRadians } from '../services/haversineService.js';

describe('Haversine Service', () => {
  
  describe('toRadians', () => {
    it('should convert degrees to radians', () => {
      expect(toRadians(180)).toBeCloseTo(Math.PI, 5);
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 5);
      expect(toRadians(0)).toBe(0);
      expect(toRadians(45)).toBeCloseTo(Math.PI / 4, 5);
    });

    it('should handle negative degrees', () => {
      expect(toRadians(-90)).toBeCloseTo(-Math.PI / 2, 5);
      expect(toRadians(-180)).toBeCloseTo(-Math.PI, 5);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two identical points', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBeCloseTo(0, 2);
    });

    it('should calculate distance between New York and nearby location', () => {
      // New York (40.7128, -74.0060) to Jersey City (40.7178, -74.0431)
      // Approximately 3.2 km
      const distance = calculateDistance(40.7128, -74.0060, 40.7178, -74.0431);
      expect(distance).toBeCloseTo(3.2, 1);
    });

    it('should handle coordinates across the equator', () => {
      // Northern point to southern point
      const distance = calculateDistance(10, 0, -10, 0);
      expect(distance).toBeCloseTo(2223.87, 1); // Approximate distance
    });

    it('should handle coordinates across the meridian', () => {
      // Eastern point to western point
      const distance = calculateDistance(0, 10, 0, -10);
      expect(distance).toBeCloseTo(2223.87, 1);
    });

    it('should return reasonable distance for far locations', () => {
      // New York to Los Angeles (approximately 4000 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4100);
    });

    it('should handle edge cases with zero coordinates', () => {
      const distance = calculateDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });

    it('should handle coordinates with very small differences', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7129, -74.0061);
      expect(distance).toBeLessThan(1); // Very close
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('findBestMaster', () => {
    const mockMasters = [
      { id: '1', name: 'Near Master', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 2 },
      { id: '2', name: 'Far Master', latitude: 40.7500, longitude: -74.0500, rating: 4.8, active_orders: 1 },
      { id: '3', name: 'Excellent Master', latitude: 40.7150, longitude: -74.0100, rating: 5.0, active_orders: 0 },
      { id: '4', name: 'Too Far Master', latitude: 41.0000, longitude: -74.5000, rating: 4.9, active_orders: 0 },
    ];

    it('should return best master within distance', () => {
      const orderLat = 40.7128;
      const orderLon = -74.0060;
      const maxDistance = 10;

      const result = findBestMaster(mockMasters, orderLat, orderLon, maxDistance);

      expect(result).not.toBeNull();
      expect(result.id).toBe('3'); // Should return the excellent master
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('score');
    });

    it('should return null when no masters are within max distance', () => {
      const orderLat = 40.7128;
      const orderLon = -74.0060;
      const maxDistance = 0.1; // Very small distance

      const result = findBestMaster(mockMasters, orderLat, orderLon, maxDistance);

      expect(result).toBeNull();
    });

    it('should return null for empty master list', () => {
      const result = findBestMaster([], 40.7128, -74.0060, 50);
      expect(result).toBeNull();
    });

    it('should return null for null/undefined masters', () => {
      expect(findBestMaster(null, 40.7128, -74.0060, 50)).toBeNull();
      expect(findBestMaster(undefined, 40.7128, -74.0060, 50)).toBeNull();
    });

    it('should prioritize closer masters over higher rated but far ones', () => {
      const localMasters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.0, active_orders: 5 },
        { id: '2', latitude: 40.7500, longitude: -74.0500, rating: 5.0, active_orders: 0 },
      ];

      const orderLat = 40.7128;
      const orderLon = -74.0060;
      const maxDistance = 20;

      const result = findBestMaster(localMasters, orderLat, orderLon, maxDistance);

      expect(result).not.toBeNull();
      // The closer master should be selected despite slightly lower rating
      expect(result.id).toBe('1');
    });

    it('should handle masters with maximum active orders', () => {
      const busyMasters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.0, active_orders: 10 },
      ];

      const result = findBestMaster(busyMasters, 40.7128, -74.0060, 50);

      expect(result).not.toBeNull();
      expect(result.active_orders).toBe(10);
    });

    it('should calculate composite score correctly', () => {
      const simpleMasters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 0 },
      ];

      const result = findBestMaster(simpleMasters, 40.7128, -74.0060, 50);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('score');
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should handle edge case with zero distance', () => {
      const result = findBestMaster(mockMasters, 40.7128, -74.0060, 0);
      expect(result).toBeNull();
    });

    it('should handle invalid coordinates', () => {
      const result = findBestMaster(mockMasters, null, null, 50);
      expect(result).toBeNull();
    });
  });
});

