/**
 * Validation utilities for order flow
 */

export function validateOrder(order) {
  const errors = [];

  // Required fields validation
  if (!order.customer_name || order.customer_name.trim() === '') {
    errors.push('customer_name is required');
  }

  if (!order.customer_phone || order.customer_phone.trim() === '') {
    errors.push('customer_phone is required');
  }

  if (!order.address || order.address.trim() === '') {
    errors.push('address is required');
  }

  // Phone number validation
  if (order.customer_phone && order.customer_phone.trim().length < 10) {
    errors.push('customer_phone must be at least 10 characters');
  }

  // Coordinate validation
  if (order.latitude !== null && order.latitude !== undefined) {
    if (typeof order.latitude !== 'number' || order.latitude < -90 || order.latitude > 90) {
      errors.push('latitude must be between -90 and 90');
    }
  }

  if (order.longitude !== null && order.longitude !== undefined) {
    if (typeof order.longitude !== 'number' || order.longitude < -180 || order.longitude > 180) {
      errors.push('longitude must be between -180 and 180');
    }
  }

  // String length validation
  if (order.customer_name && order.customer_name.length > 255) {
    errors.push('customer_name exceeds maximum length of 255 characters');
  }

  if (order.address && order.address.length > 500) {
    errors.push('address exceeds maximum length of 255 characters');
  }

  if (order.description && order.description.length > 2000) {
    errors.push('description exceeds maximum length of 2000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMaster(master) {
  const errors = [];

  if (!master.name || master.name.trim() === '') {
    errors.push('name is required');
  }

  if (!master.phone || master.phone.trim() === '') {
    errors.push('phone is required');
  }

  if (master.latitude === null || master.latitude === undefined) {
    errors.push('latitude is required');
  } else if (typeof master.latitude !== 'number' || master.latitude < -90 || master.latitude > 90) {
    errors.push('latitude must be between -90 and 90');
  }

  if (master.longitude === null || master.longitude === undefined) {
    errors.push('longitude is required');
  } else if (typeof master.longitude !== 'number' || master.longitude < -180 || master.longitude > 180) {
    errors.push('longitude must be between -180 and 180');
  }

  if (master.rating !== null && master.rating !== undefined) {
    if (typeof master.rating !== 'number' || master.rating < 0 || master.rating > 5) {
      errors.push('rating must be between 0 and 5');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

