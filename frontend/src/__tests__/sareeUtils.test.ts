import { describe, it, expect } from 'vitest';
import { formatSareeName } from '../utils/sareeUtils';

describe('sareeUtils Utility Functions', () => {
  it('should clean brand tags and format saree name correctly', () => {
    const raw = 'Kanchanika Banarasi Silk Saree Vol.14';
    const formatted = formatSareeName(raw, 'Banarasi Sarees', false);
    expect(formatted).toContain('Banarasi');
    expect(formatted).toContain('Saree');
    expect(formatted).toContain('by Kanchanika');
    expect(formatted).not.toContain('Vol.14');
  });

  it('should append Vol tag when isAdmin is true', () => {
    const raw = 'EVAN COLLECTIONS Banarasi Saree Vol.5';
    const formatted = formatSareeName(raw, 'Banarasi Sarees', true);
    expect(formatted).toContain('Vol.5');
    expect(formatted).toContain('Kanchanika');
  });

  it('should fallback to distinct category-based title when input is generic', () => {
    const raw = 'Royal Heirloom';
    const formatted = formatSareeName(raw, 'Kanchipuram Sarees', false, 'prod-1');
    expect(formatted).toContain('Kanchipuram');
    expect(formatted).toContain('Saree');
    expect(formatted).toContain('by Kanchanika');
  });
});
