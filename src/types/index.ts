export type EventType = 
  | 'wedding' 
  | 'birthday' 
  | 'community' 
  | 'anniversary' 
  | 'baby_shower' 
  | 'corporate' 
  | 'other';

export type BudgetCategory = 
  | 'venue' 
  | 'catering' 
  | 'decorations' 
  | 'entertainment' 
  | 'photography' 
  | 'attire' 
  | 'invitations' 
  | 'miscellaneous';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  isEstimate: boolean;
  notes?: string;
  paidStatus: 'unpaid' | 'deposit_paid' | 'paid_in_full';
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  category: 'venue' | 'vendors' | 'invitations' | 'logistics' | 'decor' | 'general' | 'day_of';
  targetDate: string; // YYYY-MM-DD
  time?: string; // HH:mm for day-of agenda
  status: MilestoneStatus;
  isDayOfAgenda?: boolean;
}

export type VendorBookingStatus = 'inquiry' | 'quote_received' | 'booked' | 'deposit_paid' | 'completed' | 'cancelled';

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
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  isLiveAI: boolean;
  suggestedActions?: {
    label: string;
    actionType: 'add_expense' | 'add_task' | 'add_milestone' | 'refine_theme';
    payload: any;
  }[];
}

export interface EventPlan {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location: string;
  venueType?: 'indoor' | 'outdoor' | 'hybrid' | 'destination';
  guestCount: number;
  totalBudget: number;
  themeKeywords: string;
  preferences: {
    formality?: 'casual' | 'semi-formal' | 'black-tie' | 'traditional';
    colorScheme?: string;
    dietaryNotes?: string;
    musicPreference?: string;
    specialRequests?: string;
  };
  createdAt: string;
  updatedAt: string;
  
  // Associated data
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  vendorTasks: VendorTask[];
  aiPlan?: AIPlan;
  chatHistory: ChatMessage[];
}

export interface AppSettings {
  geminiApiKey: string;
  model: string;
  preferOfflineDemo: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}
