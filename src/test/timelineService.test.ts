import { describe, it, expect } from 'vitest';
import { 
  sortMilestonesChronologically, 
  isMilestoneOverdue, 
  checkDateSequenceIssues,
  generateInitialMilestones 
} from '../services/timelineService';
import { TimelineMilestone } from '../types';

describe('Timeline Service', () => {
  it('sorts milestones chronologically by date and day-of times', () => {
    const list: TimelineMilestone[] = [
      { id: '1', title: 'Reception Dinner', description: '', category: 'day_of', targetDate: '2026-10-20', time: '19:00', status: 'pending', isDayOfAgenda: true },
      { id: '2', title: 'Book Venue', description: '', category: 'venue', targetDate: '2026-05-01', status: 'completed', isDayOfAgenda: false },
      { id: '3', title: 'Ceremony Begins', description: '', category: 'day_of', targetDate: '2026-10-20', time: '15:00', status: 'pending', isDayOfAgenda: true },
    ];

    const sorted = sortMilestonesChronologically(list);

    expect(sorted[0].id).toBe('2'); // 2026-05-01
    expect(sorted[1].id).toBe('3'); // 2026-10-20 at 15:00
    expect(sorted[2].id).toBe('1'); // 2026-10-20 at 19:00
  });

  it('detects overdue milestones accurately when target date is in the past', () => {
    const today = '2026-10-24';

    const pastPendingMilestone: TimelineMilestone = {
      id: 'm1',
      title: 'Tasting',
      description: '',
      category: 'vendors',
      targetDate: '2026-10-10', // past
      status: 'pending',
    };

    const pastCompletedMilestone: TimelineMilestone = {
      id: 'm2',
      title: 'Book Venue',
      description: '',
      category: 'venue',
      targetDate: '2026-10-10', // past but completed!
      status: 'completed',
    };

    const futureMilestone: TimelineMilestone = {
      id: 'm3',
      title: 'Final payment',
      description: '',
      category: 'general',
      targetDate: '2026-11-15', // future
      status: 'pending',
    };

    expect(isMilestoneOverdue(pastPendingMilestone, today)).toBe(true);
    expect(isMilestoneOverdue(pastCompletedMilestone, today)).toBe(false);
    expect(isMilestoneOverdue(futureMilestone, today)).toBe(false);
  });

  it('identifies sequence issues when preparation milestones occur after the event date', () => {
    const milestones: TimelineMilestone[] = [
      { id: 'm1', title: 'Book Venue', description: '', category: 'venue', targetDate: '2026-11-01', status: 'pending', isDayOfAgenda: false },
      { id: 'm2', title: 'Florist Consultation', description: '', category: 'decor', targetDate: '2026-12-10', status: 'pending', isDayOfAgenda: false },
    ];

    const issues = checkDateSequenceIssues(milestones, '2026-11-20');

    expect(issues).toHaveLength(1);
    expect(issues[0].milestoneId).toBe('m2');
  });

  it('generates rich preparation milestones and day-of agenda items', () => {
    const generated = generateInitialMilestones('2026-12-25', 'wedding');
    expect(generated.length).toBeGreaterThan(6);

    const hasPreparation = generated.some((m) => !m.isDayOfAgenda);
    const hasDayOf = generated.some((m) => m.isDayOfAgenda && m.time);

    expect(hasPreparation).toBe(true);
    expect(hasDayOf).toBe(true);
  });
});
