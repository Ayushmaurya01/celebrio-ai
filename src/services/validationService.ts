import { ValidationError, EventPlan, TimelineMilestone } from '../types';

export function validateEventForm(data: Partial<EventPlan>): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Event name is required.' });
  } else if (data.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Event name must be at least 3 characters long.' });
  }

  // Event Type validation
  if (!data.type) {
    errors.push({ field: 'type', message: 'Please select an event type.' });
  }

  // Date validation
  if (!data.date || data.date.trim().length === 0) {
    errors.push({ field: 'date', message: 'Event date is required.' });
  } else {
    const selectedDate = new Date(data.date + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) {
      errors.push({ field: 'date', message: 'Please enter a valid date.' });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push({ field: 'date', message: 'Event date cannot be in the past.' });
      }
    }
  }

  // Location validation
  if (!data.location || data.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Event location or venue is required.' });
  }

  // Guest count validation
  if (data.guestCount === undefined || data.guestCount === null || isNaN(Number(data.guestCount))) {
    errors.push({ field: 'guestCount', message: 'Guest count is required.' });
  } else {
    const guests = Number(data.guestCount);
    if (!Number.isInteger(guests) || guests <= 0) {
      errors.push({ field: 'guestCount', message: 'Guest count must be a positive whole number (at least 1).' });
    } else if (guests > 50000) {
      errors.push({ field: 'guestCount', message: 'Guest count cannot exceed 50,000.' });
    }
  }

  // Budget validation
  if (data.totalBudget === undefined || data.totalBudget === null || isNaN(Number(data.totalBudget))) {
    errors.push({ field: 'totalBudget', message: 'Budget is required.' });
  } else {
    const budget = Number(data.totalBudget);
    if (budget <= 0) {
      errors.push({ field: 'totalBudget', message: 'Budget must be greater than zero.' });
    } else if (budget > 100000000) {
      errors.push({ field: 'totalBudget', message: 'Budget exceeds maximum permitted threshold.' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTimelineMilestone(
  milestone: Partial<TimelineMilestone>,
  eventDate: string
): { isValid: boolean; errors: ValidationError[]; warnings: string[] } {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!milestone.title || milestone.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Milestone title is required.' });
  }

  if (!milestone.targetDate || milestone.targetDate.trim().length === 0) {
    errors.push({ field: 'targetDate', message: 'Target date is required.' });
  } else {
    const mDate = new Date(milestone.targetDate + 'T00:00:00');
    if (isNaN(mDate.getTime())) {
      errors.push({ field: 'targetDate', message: 'Invalid target date.' });
    } else if (eventDate) {
      const eDate = new Date(eventDate + 'T00:00:00');
      // For preparation milestones, warning if date is after event date
      if (!milestone.isDayOfAgenda && mDate > eDate) {
        warnings.push('This preparation milestone is scheduled AFTER the event date.');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
