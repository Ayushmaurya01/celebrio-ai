import { 
  BudgetCategory, 
  BudgetItem, 
  CategorySummary, 
  BudgetInsights, 
  BudgetSummary 
} from '../types';

export type { CategorySummary, BudgetInsights, BudgetSummary };

export const BUDGET_CATEGORY_METADATA: Record<
  BudgetCategory,
  { label: string; defaultPercentage: number; icon: string; color: string }
> = {
  venue: { label: 'Venue & Location', defaultPercentage: 30, icon: 'Building2', color: '#1A73E8' },
  catering: { label: 'Catering & Beverages', defaultPercentage: 25, icon: 'Utensils', color: '#EA4335' },
  decorations: { label: 'Decorations & Florals', defaultPercentage: 12, icon: 'Sparkles', color: '#FBBC04' },
  entertainment: { label: 'Music & Entertainment', defaultPercentage: 10, icon: 'Music', color: '#7C3AED' },
  photography: { label: 'Photo & Videography', defaultPercentage: 10, icon: 'Camera', color: '#0284C7' },
  attire: { label: 'Attire, Hair & Makeup', defaultPercentage: 6, icon: 'Crown', color: '#E11D48' },
  invitations: { label: 'Invitations & Favors', defaultPercentage: 3, icon: 'Mail', color: '#0D9488' },
  miscellaneous: { label: 'Buffer & Miscellaneous', defaultPercentage: 4, icon: 'ShieldCheck', color: '#34A853' },
};

export function calculateBudgetSummary(
  totalBudget: number,
  items: BudgetItem[],
  customCategoryAllocations?: Partial<Record<BudgetCategory, number>>
): BudgetSummary {
  const safeBudget = Math.max(0, Number(totalBudget) || 0);

  // Initialize categories
  const categories = {} as Record<BudgetCategory, CategorySummary>;
  const categoryKeys = Object.keys(BUDGET_CATEGORY_METADATA) as BudgetCategory[];

  let allocatedSum = 0;

  categoryKeys.forEach((cat) => {
    const meta = BUDGET_CATEGORY_METADATA[cat];
    const percentage = customCategoryAllocations?.[cat] ?? meta.defaultPercentage;
    const allocated = safeBudget > 0 ? Math.round((safeBudget * percentage) / 100) : 0;
    allocatedSum += allocated;

    categories[cat] = {
      category: cat,
      label: meta.label,
      allocatedAmount: allocated,
      allocatedPercentage: percentage,
      totalEstimated: 0,
      totalActual: 0,
      actualItemCount: 0,
      itemCount: 0,
      isOverAllocated: false,
      varianceAmount: 0,
      color: meta.color,
    };
  });

  // Balance rounding difference so category targets sum exactly to safeBudget
  if (safeBudget > 0 && allocatedSum !== safeBudget && categories.miscellaneous) {
    const diff = safeBudget - allocatedSum;
    categories.miscellaneous.allocatedAmount += diff;
  }

  let totalEstimated = 0;
  let totalActual = 0;
  let totalActualCount = 0;

  // Aggregate items from actual records
  items.forEach((item) => {
    const cat = categories[item.category] || categories.miscellaneous;
    const est = Math.max(0, Number(item.estimatedCost) || 0);
    const hasActual = item.actualCost !== undefined && item.actualCost !== null && !isNaN(Number(item.actualCost));
    const act = hasActual ? Math.max(0, Number(item.actualCost)) : 0;

    cat.totalEstimated += est;
    cat.itemCount += 1;
    totalEstimated += est;

    if (hasActual) {
      cat.totalActual += act;
      cat.actualItemCount += 1;
      totalActual += act;
      totalActualCount += 1;
    }
  });

  // Calculate variance per category
  categoryKeys.forEach((cat) => {
    const c = categories[cat];
    c.varianceAmount = c.totalEstimated - c.allocatedAmount;
    c.isOverAllocated = c.totalEstimated > c.allocatedAmount;
  });

  const remainingBudget = safeBudget - totalEstimated;
  const isOverBudget = totalEstimated > safeBudget;
  const overBudgetAmount = isOverBudget ? totalEstimated - safeBudget : 0;
  const percentageUsed = safeBudget > 0 ? Math.round((totalEstimated / safeBudget) * 100) : 0;

  // Generate deterministic, explainable insights
  const catArray = Object.values(categories);
  const activeSpendCats = catArray.filter((c) => c.totalEstimated > 0);
  const highestCategory = [...activeSpendCats].sort((a, b) => b.totalEstimated - a.totalEstimated)[0];
  const overBudgetCategories = catArray.filter((c) => c.isOverAllocated);
  const underBudgetCategories = catArray.filter((c) => !c.isOverAllocated && c.allocatedAmount > 0);

  let savingsTip = 'Your expenses are well-balanced across all categories.';
  if (isOverBudget) {
    if (overBudgetCategories.length > 0) {
      const highestOver = [...overBudgetCategories].sort((a, b) => b.varianceAmount - a.varianceAmount)[0];
      savingsTip = `${highestOver.label} exceeds target by $${highestOver.varianceAmount.toLocaleString()}. Consider reviewing vendor inclusions or menu tiers.`;
    } else {
      savingsTip = `Overall estimates exceed budget by $${overBudgetAmount.toLocaleString()}. Look for savings in miscellaneous or secondary rentals.`;
    }
  } else if (highestCategory) {
    const pctOfTotal = safeBudget > 0 ? Math.round((highestCategory.totalEstimated / safeBudget) * 100) : 0;
    savingsTip = `${highestCategory.label} represents your largest investment (${pctOfTotal}% of total budget).`;
  }

  const insights: BudgetInsights = {
    highestCategory,
    overBudgetCategories,
    underBudgetCategories,
    confirmedActualSpend: totalActual,
    hasActualsRecorded: totalActualCount > 0,
    savingsTip,
    utilizationRate: percentageUsed,
  };

  return {
    totalBudget: safeBudget,
    totalEstimated,
    totalActual,
    remainingBudget,
    percentageUsed,
    isOverBudget,
    overBudgetAmount,
    categories,
    insights,
  };
}

export function generateInitialBudgetItems(
  totalBudget: number,
  eventType: string,
  guestCount: number
): BudgetItem[] {
  const budget = Math.max(1000, totalBudget);
  
  if (eventType === 'wedding') {
    return [
      {
        id: 'b-venue-1',
        category: 'venue',
        name: 'Main Ceremony & Banquet Hall Rental',
        estimatedCost: Math.round(budget * 0.30),
        actualCost: Math.round(budget * 0.30),
        isEstimate: true,
        notes: 'Includes tables, gold Chiavari chairs & bridal suite (Deposit Paid)',
        paidStatus: 'deposit_paid',
      },
      {
        id: 'b-cat-1',
        category: 'catering',
        name: `Plated Dinner & Welcome Cocktails (${guestCount} guests)`,
        estimatedCost: Math.round(budget * 0.23),
        isEstimate: true,
        notes: 'Hors d’oeuvres, 3-course dinner & open bar estimate',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-cat-2',
        category: 'catering',
        name: 'Artisan Multi-Tier Wedding Cake',
        estimatedCost: Math.round(budget * 0.02),
        isEstimate: true,
        notes: 'Tiered floral fondant cake with tasting included',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-dec-1',
        category: 'decorations',
        name: 'Ceremony Arch, Florals & Centerpieces',
        estimatedCost: Math.round(budget * 0.12),
        isEstimate: true,
        notes: 'Rose, ivory & eucalyptus floral arrangements',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-photo-1',
        category: 'photography',
        name: 'Full-Day Photography & Cinematic Video',
        estimatedCost: Math.round(budget * 0.10),
        actualCost: Math.round(budget * 0.04), // Initial booking deposit recorded
        isEstimate: true,
        notes: 'Lead photographer, second shooter & edited highlight reel',
        paidStatus: 'deposit_paid',
      },
      {
        id: 'b-ent-1',
        category: 'entertainment',
        name: 'Live String Trio & Evening DJ Sound System',
        estimatedCost: Math.round(budget * 0.10),
        isEstimate: true,
        notes: 'Ceremony strings + 4 hours reception dance party',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-attire-1',
        category: 'attire',
        name: 'Bridal Gown / Suit & Styling Package',
        estimatedCost: Math.round(budget * 0.06),
        isEstimate: true,
        notes: 'Alterations, shoes, hair & makeup trial',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-inv-1',
        category: 'invitations',
        name: 'Foil-Pressed Invitation Suites & Stationery',
        estimatedCost: Math.round(budget * 0.03),
        isEstimate: true,
        notes: 'Save-the-dates, RSVP cards & personalized menus',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-misc-1',
        category: 'miscellaneous',
        name: 'Event Contingency & Gratuities Buffer',
        estimatedCost: Math.round(budget * 0.04),
        isEstimate: true,
        notes: 'Vendor tips, marriage license & unforeseen expenses',
        paidStatus: 'unpaid',
      },
    ];
  } else if (eventType === 'birthday') {
    return [
      {
        id: 'b-venue-1',
        category: 'venue',
        name: 'Party Lounge / Private Rooftop Rental',
        estimatedCost: Math.round(budget * 0.32),
        actualCost: Math.round(budget * 0.32),
        isEstimate: true,
        notes: 'Private space for 5 hours with sound setup',
        paidStatus: 'paid_in_full',
      },
      {
        id: 'b-cat-1',
        category: 'catering',
        name: `Buffet & Signature Birthday Cocktails (${guestCount} guests)`,
        estimatedCost: Math.round(budget * 0.28),
        isEstimate: true,
        notes: 'Finger foods, gourmet sliders & welcome punch',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-cat-2',
        category: 'catering',
        name: 'Custom Signature Celebration Cake',
        estimatedCost: Math.round(budget * 0.04),
        isEstimate: true,
        notes: 'Theme-styled artisan drip cake',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-dec-1',
        category: 'decorations',
        name: 'Balloon Arch, Neon Signage & Table Scapes',
        estimatedCost: Math.round(budget * 0.12),
        isEstimate: true,
        notes: 'Custom neon birthday sign & photo backdrop',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-ent-1',
        category: 'entertainment',
        name: 'Professional Party DJ & Lighting',
        estimatedCost: Math.round(budget * 0.10),
        isEstimate: true,
        notes: 'Sound equipment, dance floor lights, playlist curate',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-photo-1',
        category: 'photography',
        name: 'Event Photographer & Digital Photo Booth',
        estimatedCost: Math.round(budget * 0.08),
        isEstimate: true,
        notes: '3 hours roaming photos + instant GIF booth',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-misc-1',
        category: 'miscellaneous',
        name: 'Party Favors & Emergency Buffer',
        estimatedCost: Math.round(budget * 0.06),
        isEstimate: true,
        notes: 'Custom favor bags and unexpected items',
        paidStatus: 'unpaid',
      },
    ];
  } else {
    // Community / general celebration
    return [
      {
        id: 'b-venue-1',
        category: 'venue',
        name: 'Community Center / Pavilion Grounds Permit',
        estimatedCost: Math.round(budget * 0.25),
        actualCost: Math.round(budget * 0.25),
        isEstimate: true,
        notes: 'Park permit, pavilion hire, tent & restroom facilities',
        paidStatus: 'paid_in_full',
      },
      {
        id: 'b-cat-1',
        category: 'catering',
        name: `Community Food Stalls & Refreshments (${guestCount} guests)`,
        estimatedCost: Math.round(budget * 0.32),
        isEstimate: true,
        notes: 'Local food truck arrangements & hydration stations',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-dec-1',
        category: 'decorations',
        name: 'Bunting, Wayfinding Signs, Banners & Table Covers',
        estimatedCost: Math.round(budget * 0.10),
        isEstimate: true,
        notes: 'Eco-friendly banners, recycling stations & flags',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-ent-1',
        category: 'entertainment',
        name: 'Community Band, PA Stage & Lawn Games',
        estimatedCost: Math.round(budget * 0.15),
        isEstimate: true,
        notes: 'Stage audio, microphone, lawn games & host MC',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-photo-1',
        category: 'photography',
        name: 'Community Event Photographer & Drone Snaps',
        estimatedCost: Math.round(budget * 0.08),
        isEstimate: true,
        notes: 'Documentary style community coverage',
        paidStatus: 'unpaid',
      },
      {
        id: 'b-misc-1',
        category: 'miscellaneous',
        name: 'Insurance, First Aid & Waste Management',
        estimatedCost: Math.round(budget * 0.10),
        isEstimate: true,
        notes: 'City permits, volunteer kits & post-event cleanup crew',
        paidStatus: 'unpaid',
      },
    ];
  }
}
