/**
 * Celebrio AI Domain Type Definitions
 * Single canonical source of truth for all domain interfaces, enums, and types.
 */

/* ==========================================================================
   1. Navigation & App Shell
   ========================================================================== */

export type NavigationTab = 
  | 'dashboard' 
  | 'ai_planner' 
  | 'budget' 
  | 'timeline' 
  | 'vendors' 
  | 'saved_plans';

export type ToastType = 'success' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export type ShowToastFn = (message: string, type?: ToastType) => void;

export interface AppSettings {
  engineMode: 'deterministic_offline';
}

/* ==========================================================================
   2. Event Plan Core & Formality
   ========================================================================== */

export type EventType = 
  | 'wedding' 
  | 'birthday' 
  | 'community' 
  | 'anniversary' 
  | 'baby_shower' 
  | 'corporate' 
  | 'other';

export type VenueType = 'indoor' | 'outdoor' | 'hybrid' | 'destination';
export type EventFormality = 'casual' | 'semi-formal' | 'black-tie' | 'traditional';

export interface EventPreferences {
  formality?: EventFormality;
  colorScheme?: string;
  dietaryNotes?: string;
  musicPreference?: string;
  specialRequests?: string;
}

export interface EventPlan {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location: string;
  venueType?: VenueType;
  guestCount: number;
  totalBudget: number;
  themeKeywords: string;
  preferences: EventPreferences;
  createdAt: string;
  updatedAt: string;
  
  // Associated collections
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  vendorTasks: VendorTask[];
  aiPlan?: AIPlan;
  chatHistory: ChatMessage[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/* ==========================================================================
   3. Budget & Expenses
   ========================================================================== */

export type BudgetCategory = 
  | 'venue' 
  | 'catering' 
  | 'decorations' 
  | 'entertainment' 
  | 'photography' 
  | 'attire' 
  | 'invitations' 
  | 'miscellaneous';

export type PaidStatus = 'unpaid' | 'deposit_paid' | 'paid_in_full';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  isEstimate: boolean;
  notes?: string;
  paidStatus: PaidStatus;
}

export interface CategorySummary {
  category: BudgetCategory;
  label: string;
  allocatedAmount: number;
  allocatedPercentage: number;
  totalEstimated: number;
  totalActual: number;
  actualItemCount: number;
  itemCount: number;
  isOverAllocated: boolean;
  varianceAmount: number; // positive = over budget, negative = under
  color: string;
}

export interface BudgetInsights {
  highestCategory?: CategorySummary;
  overBudgetCategories: CategorySummary[];
  underBudgetCategories: CategorySummary[];
  confirmedActualSpend: number;
  hasActualsRecorded: boolean;
  savingsTip: string;
  utilizationRate: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  percentageUsed: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  categories: Record<BudgetCategory, CategorySummary>;
  insights: BudgetInsights;
}

/* ==========================================================================
   4. Timeline & Schedule
   ========================================================================== */

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';
export type MilestoneCategory = 'venue' | 'vendors' | 'invitations' | 'logistics' | 'decor' | 'general' | 'day_of';

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  targetDate: string; // YYYY-MM-DD
  time?: string; // HH:mm for day-of agenda
  status: MilestoneStatus;
  isDayOfAgenda?: boolean;
}

export interface DateSequenceIssue {
  milestoneId: string;
  issue: string;
}

export interface MilestoneValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/* ==========================================================================
   5. Vendor Tasks & Checklist
   ========================================================================== */

export type VendorBookingStatus = 'inquiry' | 'quote_received' | 'booked' | 'deposit_paid' | 'completed' | 'cancelled';
export type VendorTaskPriority = 'low' | 'medium' | 'high';

export interface VendorTask {
  id: string;
  title: string;
  category: BudgetCategory;
  vendorName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  bookingStatus: VendorBookingStatus;
  estimatedCost: number;
  dueDate: string; // YYYY-MM-DD
  priority: VendorTaskPriority;
  completed: boolean;
}

export interface VendorTaskProgress {
  total: number;
  completed: number;
  percentage: number;
  pendingCount: number;
  totalCommittedSpend: number;
}

/* ==========================================================================
   6. AI Blueprint & Assistant Chat
   ========================================================================== */

export interface AIPlanSection {
  title: string;
  iconName: string;
  summary: string;
  items: string[];
  tips?: string[];
}

export interface AIPlan {
  id: string;
  generatedAt: string;
  isLiveAI: boolean;
  modelUsed: string;
  themeTitle: string;
  themeDescription: string;
  colorPalette: { name: string; hex: string }[];
  atmosphereAndVibe: string;
  decorIdeas: AIPlanSection;
  cateringSuggestions: AIPlanSection;
  entertainmentSuggestions: AIPlanSection;
  practicalRecommendations: AIPlanSection;
  suggestedBudgetBreakdown: Record<BudgetCategory, number>; // percentages summing to 100
}

export interface PlanGenerationOptions {
  note?: string;
  forceOffline?: boolean;
}

export interface AddExpensePayload {
  name: string;
  category?: BudgetCategory;
  estimatedCost?: number;
  notes?: string;
}

export interface AddTaskPayload {
  title: string;
  category?: BudgetCategory;
  estimatedCost?: number;
  priority?: VendorTaskPriority;
  notes?: string;
}

export interface AddMilestonePayload {
  title: string;
  description?: string;
  category?: MilestoneCategory;
}

export interface RefineThemePayload {
  themeKeywords?: string;
  notes?: string;
}

export interface SuggestedAddExpenseAction {
  label: string;
  actionType: 'add_expense';
  payload: AddExpensePayload;
}

export interface SuggestedAddTaskAction {
  label: string;
  actionType: 'add_task';
  payload: AddTaskPayload;
}

export interface SuggestedAddMilestoneAction {
  label: string;
  actionType: 'add_milestone';
  payload: AddMilestonePayload;
}

export interface SuggestedRefineThemeAction {
  label: string;
  actionType: 'refine_theme';
  payload: RefineThemePayload;
}

export type SuggestedAction =
  | SuggestedAddExpenseAction
  | SuggestedAddTaskAction
  | SuggestedAddMilestoneAction
  | SuggestedRefineThemeAction;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  isLiveAI: boolean;
  suggestedActions?: SuggestedAction[];
}
