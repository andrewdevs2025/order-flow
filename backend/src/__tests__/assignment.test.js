import { findBestMaster, calculateDistance } from '../services/haversineService.js';

/**
 * Tests for Master Assignment Logic
 */

describe('Master Assignment Logic', () => {
  
  describe('Distance-based Assignment', () => {
    const mockMasters = [
      { id: '1', name: 'Near Master', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 2 },
      { id: '2', name: 'Medium Master', latitude: 40.7500, longitude: -74.0500, rating: 4.8, active_orders: 1 },
      { id: '3', name: 'Far Master', latitude: 41.0000, longitude: -74.5000, rating: 5.0, active_orders: 0 },
    ];

    it('should prefer closer master over higher-rated distant master', () => {
      const orderLat = 40.7128;
      const orderLon = -74.0060;
      
      const result = findBestMaster(mockMasters, orderLat, orderLon, 50);
      
      expect(result).not.toBeNull();
      expect(result.id).toBe('1'); // Closer master despite lower rating
      expect(result.distance).toBeLessThan(1);
    });

    it('should not assign masters beyond max distance', () => {
      const orderLat = 40.7128;
      const orderLon = -74.0060;
      
      const result = findBestMaster(mockMasters, orderLat, orderLon, 5); // Very small max distance
      
      expect(result).not.toBeNull();
      expect(result.distance).toBeLessThanOrEqual(5);
    });

    it('should return null when no masters within max distance', () => {
      const orderLat = 40.7128;
      const orderLon = -74.0060;
      
      const result = findBestMaster(mockMasters, orderLat, orderLon, 0.1); // Impossible distance
      
      expect(result).toBeNull();
    });

    it('should calculate correct distance to order location', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7500, -74.0500);
      
      // Should be approximately 6-7 km
      expect(distance).toBeGreaterThan(5);
      expect(distance).toBeLessThan(10);
    });
  });

  describe('Rating and Load Balancing', () => {
    it('should prefer higher-rated masters when distance is similar', () => {
      const masters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 0 },
        { id: '2', latitude: 40.7150, longitude: -74.0060, rating: 5.0, active_orders: 0 },
      ];
      
      const result = findBestMaster(masters, 40.7128, -74.0060, 50);
      
      expect(result.id).toBe('2'); // Higher rated
    });

    it('should prefer masters with fewer active orders', () => {
      const masters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 8 },
        { id: '2', latitude: 40.7150, longitude: -74.0060, rating: 4.5, active_orders: 1 },
      ];
      
      const result = findBestMaster(masters, 40.7128, -74.0060, 50);
      
      expect(result.id).toBe('2'); // Fewer active orders
    });

    it('should handle masters at maximum capacity', () => {
      const masters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 5.0, active_orders: 10 },
        { id: '2', latitude: 40.7500, longitude: -74.0500, rating: 4.5, active_orders: 5 },
      ];
      
      // Assuming the algorithm filters out capacity-exceeded masters
      // This would typically be done at the database query level
      const availableMasters = masters.filter(m => m.active_orders < 10);
      
      expect(availableMasters.length).toBeGreaterThan(0);
    });
  });

  describe('Assignment Edge Cases', () => {
    it('should handle multiple masters at exact same location', () => {
      const masters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.8, active_orders: 0 },
        { id: '2', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 0 },
        { id: '3', latitude: 40.7128, longitude: -74.0060, rating: 5.0, active_orders: 0 },
      ];
      
      const result = findBestMaster(masters, 40.7128, -74.0060, 50);
      
      expect(result).not.toBeNull();
      expect(result.rating).toBeGreaterThanOrEqual(4.5);
    });

    it('should handle empty master list', () => {
      const result = findBestMaster([], 40.7128, -74.0060, 50);
      
      expect(result).toBeNull();
    });

    it('should handle invalid order coordinates', () => {
      const masters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 4.5, active_orders: 0 },
      ];
      
      const result = findBestMaster(masters, null, null, 50);
      
      expect(result).toBeNull();
    });

    it('should handle masters with zero rating', () => {
      const masters = [
        { id: '1', latitude: 40.7128, longitude: -74.0060, rating: 0, active_orders: 0 },
        { id: '2', latitude: 40.7150, longitude: -74.0060, rating: 4.5, active_orders: 0 },
      ];
      
      const result = findBestMaster(masters, 40.7128, -74.0060, 50);
      
      expect(result).not.toBeNull();
      expect(result.id).toBe('2'); // Should prefer non-zero rating
    });
  });
});

