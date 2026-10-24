import { EventPlan } from '../types';
import { generateDeterministicPlan } from './aiPlannerService';
import { generateInitialBudgetItems } from './budgetService';
import { generateInitialMilestones } from './timelineService';
import { generateInitialVendorTasks } from './vendorTaskService';

export function getSampleEvents(): EventPlan[] {
  // Event 1: Maya & Liam's Wedding
  const weddingDate = '2026-11-20';
  const weddingPlanBase: EventPlan = {
    id: 'event-wedding-1',
    name: "Maya & Liam's Tuscan Villa Wedding",
    type: 'wedding',
    date: weddingDate,
    time: '15:30',
    location: 'Villa San Michele, Florence Hillside',
    venueType: 'hybrid',
    guestCount: 120,
    totalBudget: 48000,
    themeKeywords: 'Tuscan Sunset, Olive Groves, Soft Terracotta & Antique Gold',
    preferences: {
      formality: 'black-tie',
      colorScheme: 'Terracotta, Olive Green, Ivory, and Antique Gold',
      dietaryNotes: '15 Vegetarian guests, 4 Gluten-Free, Nut-free cake',
      musicPreference: 'Live Acoustic String Quartet + Contemporary Soul/Pop Showband',
      specialRequests: 'Sunset ceremony overlooking rolling cypress hills; late-night artisan woodfire pizza.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budgetItems: [],
    timeline: [],
    vendorTasks: [],
    chatHistory: [
      {
        id: 'c-1',
        sender: 'assistant',
        timestamp: '10:00 AM',
        text: "Benvenuti! I'm Celebrio AI. I've structured your Tuscan Villa celebration with rustic refinement, seasonal Italian gastronomy, and scenic timeline pacing.",
        isLiveAI: false,
      },
      {
        id: 'c-2',
        sender: 'user',
        timestamp: '10:02 AM',
        text: 'How can we manage outdoor cocktail hour if November evening gets chilly?',
        isLiveAI: false,
      },
      {
        id: 'c-3',
        sender: 'assistant',
        timestamp: '10:02 AM',
        text: 'For a November Tuscan sunset, install freestanding brushed-bronze patio heaters around the terrace perimeter. Provide a basket of monogrammed cashmere-blend pashminas for guests, and greet them with warm spiced pear cider cocktails upon arrival.',
        isLiveAI: false,
      },
    ],
  };

  weddingPlanBase.budgetItems = generateInitialBudgetItems(48000, 'wedding', 120);
  weddingPlanBase.timeline = generateInitialMilestones(weddingDate, 'wedding');
  weddingPlanBase.vendorTasks = generateInitialVendorTasks(weddingDate, 'wedding');
  weddingPlanBase.aiPlan = generateDeterministicPlan(weddingPlanBase);

  // Event 2: Arjun's 30th Birthday
  const bdayDate = '2026-12-15';
  const bdayPlanBase: EventPlan = {
    id: 'event-bday-2',
    name: "Arjun's 30th Neon Retro Synthwave Birthday",
    type: 'birthday',
    date: bdayDate,
    time: '19:00',
    location: 'The Glasshouse Rooftop Lounge, San Francisco',
    venueType: 'indoor',
    guestCount: 60,
    totalBudget: 8500,
    themeKeywords: 'Retro Synthwave, Cyberpunk Chic, Neon Violet & Metallic Gold',
    preferences: {
      formality: 'semi-formal',
      colorScheme: 'Electric Coral, Neon Violet, Metallic Gold, Midnight Black',
      dietaryNotes: 'Plentiful vegetarian street food options, dairy-free dessert',
      musicPreference: '80s New Wave, French Touch & Modern Synthwave Beats',
      specialRequests: 'Custom neon birthday backdrop and interactive retro arcade cabinet.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budgetItems: [],
    timeline: [],
    vendorTasks: [],
    chatHistory: [],
  };

  bdayPlanBase.budgetItems = generateInitialBudgetItems(8500, 'birthday', 60);
  bdayPlanBase.timeline = generateInitialMilestones(bdayDate, 'birthday');
  bdayPlanBase.vendorTasks = generateInitialVendorTasks(bdayDate, 'birthday');
  bdayPlanBase.aiPlan = generateDeterministicPlan(bdayPlanBase);

  // Event 3: Greenwood Harvest Festival
  const commDate = '2026-11-05';
  const commPlanBase: EventPlan = {
    id: 'event-comm-3',
    name: 'Greenwood Community Harvest & Makers Gala',
    type: 'community',
    date: commDate,
    time: '10:00',
    location: 'Maplewood Park & Pavilion Grounds',
    venueType: 'outdoor',
    guestCount: 400,
    totalBudget: 15000,
    themeKeywords: 'Sustainable Harvest, Autumn Foliage, Local Makers & Folk Music',
    preferences: {
      formality: 'casual',
      colorScheme: 'Earthy Ochre, Forest Green, Sunbeam Gold, Warm Canvas',
      dietaryNotes: 'Zero-waste compostable packaging, farm-to-table food trucks',
      musicPreference: 'Local Acoustic Bluegrass & Community Brass Band',
      specialRequests: 'Accessible ramps for mobility scooters, kid-friendly pumpkin painting pavilion.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    budgetItems: [],
    timeline: [],
    vendorTasks: [],
    chatHistory: [],
  };

  commPlanBase.budgetItems = generateInitialBudgetItems(15000, 'community', 400);
  commPlanBase.timeline = generateInitialMilestones(commDate, 'community');
  commPlanBase.vendorTasks = generateInitialVendorTasks(commDate, 'community');
  commPlanBase.aiPlan = generateDeterministicPlan(commPlanBase);

  return [weddingPlanBase, bdayPlanBase, commPlanBase];
}
