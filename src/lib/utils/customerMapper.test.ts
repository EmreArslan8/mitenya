import { describe, it, expect } from 'vitest';
import { mapCreateCustomerPayload, mapSupabaseCustomer } from './customerMapper';

describe('mapCreateCustomerPayload', () => {
  it('should map full customer data', () => {
    const body = {
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      culture: 'tr',
      phone: '+905551234567',
      warehouseId: 'wh-123',
    };

    const result = mapCreateCustomerPayload(body);

    expect(result).toEqual({
      full_name: 'John Doe',
      email: 'john@example.com',
      culture: 'tr',
      phone: '+905551234567',
      warehouse_id: 'wh-123',
    });
  });

  it('should handle missing name', () => {
    const body = { surname: 'Doe' };
    const result = mapCreateCustomerPayload(body);
    expect(result.full_name).toBe('Doe');
  });

  it('should handle missing surname', () => {
    const body = { name: 'John' };
    const result = mapCreateCustomerPayload(body);
    expect(result.full_name).toBe('John');
  });

  it('should handle empty body', () => {
    const result = mapCreateCustomerPayload({});
    expect(result).toEqual({
      full_name: '',
      email: null,
      culture: 'en',
      phone: null,
      warehouse_id: null,
    });
  });

  it('should default culture to en', () => {
    const body = { name: 'John' };
    const result = mapCreateCustomerPayload(body);
    expect(result.culture).toBe('en');
  });

  it('should trim whitespace from full_name', () => {
    const body = { name: 'John', surname: '' };
    const result = mapCreateCustomerPayload(body);
    expect(result.full_name).toBe('John');
  });
});

describe('mapSupabaseCustomer', () => {
  it('should map customer DB data to CustomerData', () => {
    const raw = {
      full_name: 'John Doe',
      email: 'john@example.com',
      culture: 'tr',
      phone: '+905551234567',
    };

    const result = mapSupabaseCustomer(raw as any);

    expect(result).toEqual({
      fullName: 'John Doe',
      email: 'john@example.com',
      culture: 'tr',
      phone: '+905551234567',
    });
  });

  it('should handle null phone', () => {
    const raw = {
      full_name: 'John Doe',
      email: 'john@example.com',
      culture: 'en',
      phone: null,
    };

    const result = mapSupabaseCustomer(raw as any);

    expect(result.phone).toBeUndefined();
  });

  it('should map minimum required fields', () => {
    const raw = {
      full_name: 'Jane',
      email: 'jane@example.com',
      culture: 'en',
      phone: null,
    };

    const result = mapSupabaseCustomer(raw as any);

    expect(result.fullName).toBe('Jane');
    expect(result.email).toBe('jane@example.com');
    expect(result.culture).toBe('en');
  });
});
