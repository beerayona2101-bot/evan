import { describe, it, expect } from 'vitest';

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/^(\+?91)/, '').replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleanPhone);
};

export const validatePincode = (pin: string): boolean => {
  const cleanPin = pin.trim();
  return /^[1-9][0-9]{5}$/.test(cleanPin);
};

export const validateAddressText = (address: string): boolean => {
  if (!address || address.trim().length < 5) return false;
  const spamRegex = /\b(fake|test|asdf|qwerty|12345|dummy|xxx|null|undefined)\b/i;
  return !spamRegex.test(address);
};

describe('Checkout Validation Rules', () => {
  describe('Indian Phone Number Validation', () => {
    it('accepts valid 10-digit Indian mobile numbers', () => {
      expect(validatePhone('9876543210')).toBe(true);
      expect(validatePhone('+91 81234 56789')).toBe(true);
    });

    it('rejects invalid mobile numbers', () => {
      expect(validatePhone('5876543210')).toBe(false);
      expect(validatePhone('98765')).toBe(false);
      expect(validatePhone('987654321099')).toBe(false);
    });
  });

  describe('Indian Postal Pincode Validation', () => {
    it('accepts valid 6-digit Pincodes', () => {
      expect(validatePincode('400001')).toBe(true);
      expect(validatePincode('560001')).toBe(true);
    });

    it('rejects invalid Pincodes', () => {
      expect(validatePincode('012345')).toBe(false);
      expect(validatePincode('40001')).toBe(false);
      expect(validatePincode('ABCDEF')).toBe(false);
    });
  });

  describe('Address Sanity Check', () => {
    it('accepts legitimate delivery addresses', () => {
      expect(validateAddressText('Flat 304, Green Valley Apartments, MG Road')).toBe(true);
    });

    it('flags test/spam placeholder addresses', () => {
      expect(validateAddressText('asdf test address 12345')).toBe(false);
      expect(validateAddressText('qwerty street dummy town')).toBe(false);
    });
  });
});
