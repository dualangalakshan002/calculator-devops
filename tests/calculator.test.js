const { calculate } = require('../src/calculator');

describe('calculate()', () => {
  test('adds two numbers', () => {
    expect(calculate(2, 3, 'add')).toBe(5);
  });

  test('subtracts two numbers', () => {
    expect(calculate(10, 4, 'subtract')).toBe(6);
  });

  test('multiplies two numbers', () => {
    expect(calculate(3, 4, 'multiply')).toBe(12);
  });

  test('divides two numbers', () => {
    expect(calculate(10, 2, 'divide')).toBe(5);
  });

  test('accepts numbers sent as strings', () => {
    expect(calculate('7', '3', 'add')).toBe(10);
  });

  test('throws on divide by zero', () => {
    expect(() => calculate(5, 0, 'divide')).toThrow('Cannot divide by zero');
  });

  test('throws on invalid number', () => {
    expect(() => calculate('abc', 1, 'add')).toThrow('a must be a valid number');
  });

  test('throws on empty input', () => {
    expect(() => calculate(1, '', 'add')).toThrow('b must be a valid number');
  });

  test('throws on unknown operation', () => {
    expect(() => calculate(1, 2, 'power')).toThrow('Unknown operation: power');
  });
});