import { describe, it, expect } from 'vitest';
import { validateEventForm, validateTimelineMilestone } from '../services/validationService';

describe('Validation Service', () => {
  it('validates a complete, valid event form successfully', () => {
    // 3 months in future
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];

    const result = validateEventForm({
      name: 'Autumn Harvest Festival',
      type: 'community',
      date: dateStr,
      location: 'Central Town Square',
      guestCount: 250,
      totalBudget: 15000,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing or too short event name', () => {
    const result = validateEventForm({
      name: '  ',
      type: 'wedding',
      date: '2027-01-01',
      location: 'Palace Hall',
      guestCount: 50,
      totalBudget: 5000,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('rejects dates in the past', () => {
    const pastDate = '2020-05-15';
    const result = validateEventForm({
      name: 'Anniversary Party',
      type: 'anniversary',
      date: pastDate,
      location: 'Rooftop Bar',
      guestCount: 30,
      totalBudget: 3000,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'date' && e.message.includes('past'))).toBe(true);
  });

  it('rejects negative or zero total budget values', () => {
    const zeroResult = validateEventForm({
      name: 'Birthday Party',
      type: 'birthday',
      date: '2027-12-01',
      location: 'Lounge',
      guestCount: 20,
      totalBudget: 0,
    });
    expect(zeroResult.isValid).toBe(false);
    expect(zeroResult.errors.some((e) => e.field === 'totalBudget')).toBe(true);

    const negResult = validateEventForm({
      name: 'Birthday Party',
      type: 'birthday',
      date: '2027-12-01',
      location: 'Lounge',
      guestCount: 20,
      totalBudget: -500,
    });
    expect(negResult.isValid).toBe(false);
    expect(negResult.errors.some((e) => e.field === 'totalBudget')).toBe(true);
  });

  it('rejects invalid or non-positive guest count', () => {
    const result = validateEventForm({
      name: 'Gala Dinner',
      type: 'corporate',
      date: '2027-06-01',
      location: 'Convention Center',
      guestCount: 0,
      totalBudget: 10000,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'guestCount')).toBe(true);
  });

  it('detects milestone scheduled after event date and issues warning', () => {
    const eventDate = '2026-12-01';
    const milestoneDate = '2026-12-15'; // after event date

    const result = validateTimelineMilestone(
      {
        title: 'Send formal invitations',
        targetDate: milestoneDate,
        isDayOfAgenda: false,
      },
      eventDate
    );

    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('AFTER the event date');
  });
});
