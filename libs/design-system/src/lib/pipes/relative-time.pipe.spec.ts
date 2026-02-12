import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    pipe = new RelativeTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(pipe.transform('invalid-date')).toBe('');
  });

  it('should return "just now" for dates less than 60 seconds ago', () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(pipe.transform(thirtySecondsAgo)).toBe('just now');
  });

  it('should return minutes for dates less than an hour ago', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(pipe.transform(fiveMinutesAgo)).toBe('5m ago');

    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    expect(pipe.transform(thirtyMinutesAgo)).toBe('30m ago');
  });

  it('should return hours for dates less than a day ago', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
    expect(pipe.transform(twoHoursAgo)).toBe('2h ago');

    const twelveHoursAgo = new Date(now.getTime() - 12 * 3600 * 1000);
    expect(pipe.transform(twelveHoursAgo)).toBe('12h ago');
  });

  it('should return days for dates less than a week ago', () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400 * 1000);
    expect(pipe.transform(twoDaysAgo)).toBe('2d ago');

    const sixDaysAgo = new Date(now.getTime() - 6 * 86400 * 1000);
    expect(pipe.transform(sixDaysAgo)).toBe('6d ago');
  });

  it('should return absolute date for dates older than a week', () => {
    const now = new Date();
    const eightDaysAgo = new Date(now.getTime() - 8 * 86400 * 1000);
    const result = pipe.transform(eightDaysAgo);

    // Check that result matches the format "MMM DD, YYYY"
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });

  it('should handle string dates', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const dateString = fiveMinutesAgo.toISOString();

    expect(pipe.transform(dateString)).toBe('5m ago');
  });

  it('should handle Date objects', () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    expect(pipe.transform(tenMinutesAgo)).toBe('10m ago');
  });

  it('should return absolute date for future dates', () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400 * 1000);
    const result = pipe.transform(tomorrow);

    // Future dates should be formatted as absolute dates
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
  });
});
