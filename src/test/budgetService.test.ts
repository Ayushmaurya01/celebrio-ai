import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary, generateInitialBudgetItems } from '../services/budgetService';
import { BudgetItem } from '../types';

describe('Budget Service', () => {
  it('calculates total estimated cost, remaining budget, and percentage used correctly', () => {
    const items: BudgetItem[] = [
      { id: '1', category: 'venue', name: 'Venue Rental', estimatedCost: 5000, isEstimate: true, paidStatus: 'paid_in_full' },
      { id: '2', category: 'catering', name: 'Dinner & Drinks', estimatedCost: 3500, isEstimate: true, paidStatus: 'deposit_paid' },
      { id: '3', category: 'decorations', name: 'Arch & Florals', estimatedCost: 1500, isEstimate: true, paidStatus: 'unpaid' },
    ];

    const summary = calculateBudgetSummary(12000, items);

    expect(summary.totalBudget).toBe(12000);
    expect(summary.totalEstimated).toBe(10000);
    expect(summary.remainingBudget).toBe(2000);
    expect(summary.percentageUsed).toBe(83); // 10000 / 12000 = 83.33% -> 83%
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overBudgetAmount).toBe(0);
  });

  it('detects over-budget scenario and calculates exact excess amount', () => {
    const items: BudgetItem[] = [
      { id: '1', category: 'venue', name: 'Luxury Ballroom', estimatedCost: 15000, isEstimate: true, paidStatus: 'unpaid' },
      { id: '2', category: 'catering', name: 'Gourmet Plated', estimatedCost: 8000, isEstimate: true, paidStatus: 'unpaid' },
    ];

    const summary = calculateBudgetSummary(20000, items);

    expect(summary.totalBudget).toBe(20000);
    expect(summary.totalEstimated).toBe(23000);
    expect(summary.remainingBudget).toBe(-3000);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.overBudgetAmount).toBe(3000);
  });

  it('calculates category allocations and flags over-allocated categories', () => {
    const items: BudgetItem[] = [
      // Venue default allocation is 30% of $10,000 = $3,000
      { id: '1', category: 'venue', name: 'Venue Hire', estimatedCost: 4000, isEstimate: true, paidStatus: 'unpaid' },
    ];

    const summary = calculateBudgetSummary(10000, items);

    expect(summary.categories.venue.allocatedAmount).toBe(3000);
    expect(summary.categories.venue.totalEstimated).toBe(4000);
    expect(summary.categories.venue.isOverAllocated).toBe(true);

    // Catering default is 25% of $10,000 = $2,500
    expect(summary.categories.catering.allocatedAmount).toBe(2500);
    expect(summary.categories.catering.totalEstimated).toBe(0);
    expect(summary.categories.catering.isOverAllocated).toBe(false);
  });

  it('generates tailored initial budget items for wedding and birthday', () => {
    const weddingItems = generateInitialBudgetItems(30000, 'wedding', 100);
    expect(weddingItems.length).toBeGreaterThan(5);
    expect(weddingItems.some((i) => i.category === 'venue')).toBe(true);
    expect(weddingItems.some((i) => i.category === 'photography')).toBe(true);
    expect(weddingItems.every((i) => i.isEstimate)).toBe(true);

    const bdayItems = generateInitialBudgetItems(5000, 'birthday', 40);
    expect(bdayItems.some((i) => i.name.toLowerCase().includes('cake'))).toBe(true);
  });

  it('tracks confirmed actual expenses and derives deterministic insights', () => {
    const items: BudgetItem[] = [
      { id: '1', category: 'venue', name: 'Venue Rental', estimatedCost: 6000, actualCost: 6000, isEstimate: true, paidStatus: 'paid_in_full' },
      { id: '2', category: 'catering', name: 'Catering Dinner', estimatedCost: 4000, actualCost: 1500, isEstimate: true, paidStatus: 'deposit_paid' },
      { id: '3', category: 'photography', name: 'Photographer', estimatedCost: 2000, isEstimate: true, paidStatus: 'unpaid' }, // no actual
    ];

    const summary = calculateBudgetSummary(15000, items);

    expect(summary.totalEstimated).toBe(12000);
    expect(summary.totalActual).toBe(7500); // 6000 + 1500
    expect(summary.insights.hasActualsRecorded).toBe(true);
    expect(summary.insights.confirmedActualSpend).toBe(7500);
    expect(summary.insights.highestCategory?.category).toBe('venue');
  });

  it('handles zero budget and empty categories without division-by-zero errors', () => {
    const summary = calculateBudgetSummary(0, []);

    expect(summary.totalBudget).toBe(0);
    expect(summary.totalEstimated).toBe(0);
    expect(summary.percentageUsed).toBe(0);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.remainingBudget).toBe(0);
  });
});
