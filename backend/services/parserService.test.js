const { extractAmount, extractDate, extractServiceName } = require('./parserService');

describe('extractAmount', () => {
  test('extracts a simple dollar amount', () => {
    expect(extractAmount('Your payment of $15.99 was successful')).toBe(15.99);
  });

  test('extracts amount with comma thousands separator', () => {
    expect(extractAmount('Total charged: $1,299.00')).toBe(1299.00);
  });

  test('returns null when no amount is present', () => {
    expect(extractAmount('This is just a regular email with no price')).toBeNull();
  });
});

describe('extractDate', () => {
  test('extracts MM/DD/YYYY format', () => {
    const result = extractDate('Your renewal date is 05/20/2026');
    expect(result.getFullYear()).toBe(2026);
  });

  test('extracts Month DD, YYYY format', () => {
    const result = extractDate('Renews on May 20, 2026');
    expect(result.getFullYear()).toBe(2026);
  });

  test('returns null when no date is present', () => {
    expect(extractDate('No date mentioned here')).toBeNull();
  });
});

describe('extractServiceName', () => {
  test('extracts name from email domain', () => {
    expect(extractServiceName('Netflix <info@netflix.com>')).toBe('Netflix');
  });

  test('falls back to display name if domain parsing fails', () => {
    expect(extractServiceName('"Some Service" <no-domain>')).toBe('Some Service');
  });
});