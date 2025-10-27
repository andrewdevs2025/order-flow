import { extractGPSMetadata, validateFile, convertDMSToDD } from '../services/gpsService.js';

describe('GPS Service', () => {
  
  describe('validateFile', () => {
    it('should accept valid image file', () => {
      const validFile = {
        mimetype: 'image/jpeg',
        size: 5 * 1024 * 1024 // 5MB
      };
      
      expect(() => validateFile(validFile)).not.toThrow();
    });

    it('should accept valid video file', () => {
      const validFile = {
        mimetype: 'video/mp4',
        size: 8 * 1024 * 1024 // 8MB
      };
      
      expect(() => validateFile(validFile)).not.toThrow();
    });

    it('should reject invalid file type', () => {
      const invalidFile = {
        mimetype: 'application/pdf',
        size: 1 * 1024 * 1024
      };
      
      expect(() => validateFile(invalidFile)).toThrow('Invalid file type');
    });

    it('should reject file exceeding size limit', () => {
      const largeFile = {
        mimetype: 'image/jpeg',
        size: 15 * 1024 * 1024 // 15MB
      };
      
      expect(() => validateFile(largeFile)).toThrow('File size exceeds 10MB limit');
    });

    it('should reject file at exactly 10MB boundary', () => {
      const boundaryFile = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024 // Exactly 10MB
      };
      
      expect(() => validateFile(boundaryFile)).toThrow('File size exceeds 10MB limit');
    });

    it('should accept PNG files', () => {
      const pngFile = {
        mimetype: 'image/png',
        size: 2 * 1024 * 1024
      };
      
      expect(() => validateFile(pngFile)).not.toThrow();
    });
  });

  describe('convertDMSToDD', () => {
    it('should convert DMS to decimal degrees (North)', () => {
      const result = convertDMSToDD("40° 42' 46.08\"", 'N');
      expect(result).toBeCloseTo(40.7128, 4);
    });

    it('should convert DMS to decimal degrees (South)', () => {
      const result = convertDMSToDD("40° 42' 46.08\"", 'S');
      expect(result).toBeCloseTo(-40.7128, 4);
    });

    it('should convert DMS to decimal degrees (East)', () => {
      const result = convertDMSToDD("74° 0' 21.6\"", 'E');
      expect(result).toBeCloseTo(74.006, 2);
    });

    it('should convert DMS to decimal degrees (West)', () => {
      const result = convertDMSToDD("74° 0' 21.6\"", 'W');
      expect(result).toBeCloseTo(-74.006, 2);
    });

    it('should handle format without symbols', () => {
      const result = convertDMSToDD('40 42 46.08', 'N');
      expect(result).toBeCloseTo(40.7128, 4);
    });

    it('should handle colon format', () => {
      const result = convertDMSToDD('40:42:46.08', 'N');
      expect(result).toBeCloseTo(40.7128, 4);
    });

    it('should throw error for invalid format', () => {
      expect(() => convertDMSToDD('invalid format', 'N')).toThrow('Invalid DMS format');
    });
  });

  describe('extractGPSMetadata', () => {
    it('should return mock data for small files', async () => {
      const smallBuffer = Buffer.from('small file');
      const result = await extractGPSMetadata(smallBuffer, 'image/jpeg');
      
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.latitude).toBe('number');
      expect(typeof result.longitude).toBe('number');
    });

    it('should throw error for non-image files', async () => {
      const buffer = Buffer.from('some content');
      
      await expect(extractGPSMetadata(buffer, 'application/pdf'))
        .rejects.toThrow('GPS extraction only supported for image files');
    });

    it('should handle image files without GPS data', async () => {
      // Create a larger buffer that won't trigger the mock path
      const buffer = Buffer.alloc(10000, 'some image content');
      
      // Should return mock data as a fallback
      const result = await extractGPSMetadata(buffer, 'image/jpeg');
      
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(result).toHaveProperty('timestamp');
    });
  });
});

