import { describe, it, expect } from 'vitest';
import { generateDeterministicPlan, generateDeterministicChatReply } from '../services/aiPlannerService';
import { EventPlan } from '../types';

describe('AI Planner Service (Deterministic Engine)', () => {
  const sampleEvent: EventPlan = {
    id: 'test-event-1',
    name: 'Eleanor & Thomas Wedding',
    type: 'wedding',
    date: '2027-04-18',
    location: 'Napa Valley Winery Estate',
    guestCount: 150,
    totalBudget: 45000,
    themeKeywords: 'Rustic Chic, Champagne, Olive & Terracotta',
    preferences: {
      formality: 'black-tie',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budgetItems: [],
    timeline: [],
    vendorTasks: [],
    chatHistory: [],
  };

  it('generates a complete, tailored plan with all required sections and color palette', () => {
    const plan = generateDeterministicPlan(sampleEvent);

    expect(plan.themeTitle).toBeTruthy();
    expect(plan.themeDescription).toBeTruthy();
    expect(plan.colorPalette.length).toBeGreaterThanOrEqual(4);
    expect(plan.atmosphereAndVibe).toBeTruthy();

    expect(plan.decorIdeas.items.length).toBeGreaterThanOrEqual(3);
    expect(plan.cateringSuggestions.items.length).toBeGreaterThanOrEqual(3);
    expect(plan.entertainmentSuggestions.items.length).toBeGreaterThanOrEqual(3);
    expect(plan.practicalRecommendations.items.length).toBeGreaterThanOrEqual(3);

    // Verify budget breakdown totals
    const sum = Object.values(plan.suggestedBudgetBreakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);

    // Verify explicit label - never claims to be live AI
    expect(plan.isLiveAI).toBe(false);
    expect(plan.modelUsed).toContain('Deterministic');
  });

  it('generates contextual conversational replies with suggested interactive actions for budget queries', () => {
    const reply = generateDeterministicChatReply('How can we optimize our budget and cut costs?', sampleEvent, false);

    expect(reply.sender).toBe('assistant');
    expect(reply.text.toLowerCase()).toContain('budget');
    expect(reply.isLiveAI).toBe(false);
    expect(reply.suggestedActions).toBeDefined();
    expect(reply.suggestedActions?.some((a) => a.actionType === 'add_expense')).toBe(true);
  });

  it('generates contextual conversational replies for food and dietary queries', () => {
    const reply = generateDeterministicChatReply('What vegetarian food and menu items do you suggest?', sampleEvent, false);

    expect(reply.text.toLowerCase()).toContain('vegan');
    expect(reply.suggestedActions?.some((a) => a.actionType === 'add_task')).toBe(true);
  });
});
