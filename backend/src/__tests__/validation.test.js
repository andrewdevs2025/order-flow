import { validateOrder } from './validation.js';

describe('Order Validation', () => {

  describe('Required Fields', () => {
    it('should validate order with all required fields', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject order missing customer_name', () => {
      const order = {
        customer_phone: '+1234567890',
        address: '123 Main St'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('customer_name is required');
    });

    it('should reject order missing customer_phone', () => {
      const order = {
        customer_name: 'John Doe',
        address: '123 Main St'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('customer_phone is required');
    });

    it('should reject order missing address', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('address is required');
    });

    it('should validate all missing fields together', () => {
      const order = {};

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '+1 234 567 8900',
        '(123) 456-7890'
      ];

      validPhones.forEach(phone => {
        const order = {
          customer_name: 'John Doe',
          customer_phone: phone,
          address: '123 Main St'
        };

        const result = validateOrder(order);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['', 'abc', '12', '123', '+'];

      invalidPhones.forEach(phone => {
        const order = {
          customer_name: 'John Doe',
          customer_phone: phone,
          address: '123 Main St'
        };

        const result = validateOrder(order);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Coordinate Validation', () => {
    it('should accept valid latitude/longitude', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid latitude (out of range)', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St',
        latitude: 91,
        longitude: -74.0060
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('latitude must be between -90 and 90');
    });

    it('should reject invalid longitude (out of range)', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St',
        latitude: 40.7128,
        longitude: 181
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('longitude must be between -180 and 180');
    });

    it('should handle null coordinates', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St',
        latitude: null,
        longitude: null
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
    });

    it('should handle missing coordinates', () => {
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
    });
  });

  describe('String Length Validation', () => {
    it('should validate maximum string lengths', () => {
      const longString = 'a'.repeat(300);
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: longString
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('address exceeds maximum length of 255 characters');
    });

    it('should validate customer_name length', () => {
      const longName = 'a'.repeat(300);
      const order = {
        customer_name: longName,
        customer_phone: '+1234567890',
        address: '123 Main St'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
    });

    it('should validate description can be long', () => {
      const longDescription = 'a'.repeat(1000);
      const order = {
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        address: '123 Main St',
        description: longDescription
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const order = {
        customer_name: '',
        customer_phone: '',
        address: ''
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
    });

    it('should handle whitespace-only strings', () => {
      const order = {
        customer_name: '   ',
        customer_phone: '   ',
        address: '   '
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(false);
    });

    it('should handle special characters in names', () => {
      const order = {
        customer_name: 'O\'Brien-Smith',
        customer_phone: '+1234567890',
        address: '123 Main St'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
    });

    it('should handle Unicode characters', () => {
      const order = {
        customer_name: 'José García',
        customer_phone: '+1234567890',
        address: '北京路'
      };

      const result = validateOrder(order);
      expect(result.isValid).toBe(true);
    });
  });
});

