import { describe, it, expect } from 'vitest';
import { generateId } from '../utils/idUtils';

describe('idUtils', () => {
  it('generates IDs with the requested prefix', () => {
    const eventId = generateId('event');
    expect(eventId.startsWith('event-')).toBe(true);

    const budgetId = generateId('b');
    expect(budgetId.startsWith('b-')).toBe(true);

    const taskId = generateId('vt');
    expect(taskId.startsWith('vt-')).toBe(true);

    const milestoneId = generateId('m');
    expect(milestoneId.startsWith('m-')).toBe(true);
  });

  it('normalizes prefixes that already end with a hyphen', () => {
    const idWithHyphen = generateId('event-');
    expect(idWithHyphen.startsWith('event-')).toBe(true);
    // Should NOT produce double hyphens like 'event--12345'
    expect(idWithHyphen.startsWith('event--')).toBe(false);
  });

  it('uses default prefix if none is specified', () => {
    const defaultId = generateId();
    expect(defaultId.startsWith('id-')).toBe(true);
  });

  it('matches the expected prefix-timestamp-randomSuffix pattern', () => {
    const id = generateId('toast');
    const regex = /^toast-\d{10,15}-[a-z0-9]{5,7}$/;
    expect(regex.test(id)).toBe(true);
  });

  it('generates collision-resistant IDs across 1,000 rapid sequential calls', () => {
    const count = 1000;
    const generated = new Set<string>();

    for (let i = 0; i < count; i++) {
      const id = generateId('test');
      generated.add(id);
    }

    expect(generated.size).toBe(count);
  });
});
