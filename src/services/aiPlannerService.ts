import { AIPlan, EventPlan, ChatMessage } from '../types';

export interface PlanGenerationOptions {
  apiKey?: string;
  model?: string;
  forceOffline?: boolean;
}

export async function generateAIEventPlan(
  event: EventPlan,
  options?: PlanGenerationOptions
): Promise<AIPlan> {
  const apiKey = options?.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  const isLive = Boolean(apiKey && !options?.forceOffline);

  if (isLive) {
    try {
      const plan = await callGeminiForPlan(event, apiKey, options?.model || 'gemini-2.5-flash');
      return plan;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic offline planner:', err);
      // Fallback with explicit offline label
      return generateDeterministicPlan(event, 'Fallback from live API failure');
    }
  }

  // Pure deterministic offline planner
  return generateDeterministicPlan(event);
}

export async function sendChatMessageToPlanner(
  userQuery: string,
  event: EventPlan,
  chatHistory: ChatMessage[],
  options?: PlanGenerationOptions
): Promise<ChatMessage> {
  const apiKey = options?.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  const isLive = Boolean(apiKey && !options?.forceOffline);

  if (isLive) {
    try {
      return await callGeminiForChat(userQuery, event, chatHistory, apiKey, options?.model || 'gemini-2.5-flash');
    } catch (err) {
      console.warn('Gemini chat failed, falling back to deterministic planner:', err);
      return generateDeterministicChatReply(userQuery, event, true);
    }
  }

  return generateDeterministicChatReply(userQuery, event, false);
}

/**
 * Deterministic, rich, bespoke plan generator tailored to event type, theme, budget, and guest count.
 */
export function generateDeterministicPlan(event: EventPlan, note?: string): AIPlan {
  const type = event.type;
  const guests = event.guestCount || 50;
  const budget = event.totalBudget || 5000;
  const themeInput = event.themeKeywords?.trim() || '';
  const costPerGuest = Math.round(budget / guests);

  let themeTitle = '';
  let themeDescription = '';
  let colorPalette: { name: string; hex: string }[] = [];
  let atmosphere = '';

  if (type === 'wedding') {
    if (themeInput.toLowerCase().includes('boho') || themeInput.toLowerCase().includes('rustic')) {
      themeTitle = 'Sunlit Meadow & Warm Terracotta Elegance';
      themeDescription = 'A relaxed, earth-toned romance blending organic pampas grass, warm terracotta pottery, raw silk ribbons, and intimate candlelight.';
      colorPalette = [
        { name: 'Warm Terracotta', hex: '#D97736' },
        { name: 'Oatmeal & Ivory', hex: '#F7F3EE' },
        { name: 'Sage Green', hex: '#8A9A86' },
        { name: 'Vintage Gold', hex: '#C59B27' },
      ];
      atmosphere = 'Intimate, effortless, warm, and natural with acoustic bohemian melodies and cozy candlelit seating.';
    } else {
      themeTitle = 'Timeless Ivory & Champagne Blossom';
      themeDescription = `An elevated, romantic celebration highlighting lush white florals, soft champagne linens, warm amber bistro lighting, and refined architectural accents in ${event.location}.`;
      colorPalette = [
        { name: 'Warm Ivory', hex: '#FAF7F2' },
        { name: 'Champagne Gold', hex: '#E5C07B' },
        { name: 'Blush Petal', hex: '#EBB4B0' },
        { name: 'Deep Espresso', hex: '#2B2D42' },
      ];
      atmosphere = 'Sophisticated, luminous, deeply romantic with smooth lounge jazz during cocktails transitioning into high-energy dance celebrations.';
    }
  } else if (type === 'birthday') {
    if (themeInput.toLowerCase().includes('retro') || themeInput.toLowerCase().includes('disco')) {
      themeTitle = 'Neon Glow & Golden Disco Nights';
      themeDescription = 'An electric retro-chic evening with shimmering metallic tinsel, statement LED neon script, velvet bar seating, and dazzling mirror balls.';
      colorPalette = [
        { name: 'Electric Coral', hex: '#FF6B6B' },
        { name: 'Warm Gold', hex: '#FFD166' },
        { name: 'Midnight Velvet', hex: '#1E1E24' },
        { name: 'Deep Orchid', hex: '#9B5DE5' },
      ];
      atmosphere = 'High energy, vibrant, glamorous, filled with nostalgic dance anthems and interactive cocktail flair.';
    } else {
      themeTitle = 'Golden Horizon & Modern Botanical Soirée';
      themeDescription = `A chic modern milestone celebration curated for ${guests} guests featuring botanical greenery walls, warm filament Edison bulbs, and craft cocktail bars in ${event.location}.`;
      colorPalette = [
        { name: 'Botanical Olive', hex: '#588157' },
        { name: 'Ivory Cream', hex: '#F8F9FA' },
        { name: 'Brushed Gold', hex: '#D4AF37' },
        { name: 'Warm Coral', hex: '#F4A261' },
      ];
      atmosphere = 'Upbeat, welcoming, festive and conversational with great acoustics and photo-ready corners.';
    }
  } else if (type === 'community') {
    themeTitle = 'Harvest Commons & Community Festivity';
    themeDescription = `A welcoming, all-ages neighborhood celebration with sustainable festival bunting, local artisan stalls, picnic lawn areas, and open acoustic stage.`;
    colorPalette = [
      { name: 'Earthy Ochre', hex: '#E76F51' },
      { name: 'Fresh Fern', hex: '#2A9D8F' },
      { name: 'Sunbeam Gold', hex: '#E9C46A' },
      { name: 'Natural Canvas', hex: '#F4F1DE' },
    ];
    atmosphere = 'Lively, inclusive, family-friendly, and vibrant with open-air lawn games and community music performances.';
  } else {
    themeTitle = 'Refined Elegance & Sunset Radiance';
    themeDescription = `A bespoke celebration tailored for ${event.name}, combining thoughtful modern design, cohesive lighting, and seamless guest hospitality.`;
    colorPalette = [
      { name: 'Warm Rose', hex: '#C85A54' },
      { name: 'Gold Champagne', hex: '#C59B27' },
      { name: 'Soft Cream', hex: '#FFFDF9' },
      { name: 'Slate Gray', hex: '#495057' },
    ];
    atmosphere = 'Harmonious, polished, engaging, and memorable for every invited attendee.';
  }

  // Bespoke Decor Ideas
  const decorItems = [
    `Grand Entrance: Welcoming custom archway with warm gold welcome calligraphy on frosted acrylic and fairy-light drapery.`,
    `Tablescape Design: Textured ivory linen runners with low floral compotes (allowing guests to converse easily across tables).`,
    `Atmospheric Illumination: Dimmable warm-toned festoon lights overhead paired with floating hurricane glass pillar candles.`,
    `Signature Photo Backdrop: Lush botanical greenery wall or architectural arch styled with ${colorPalette[0].name} accents and custom LED signage.`,
    `Guest Experience Station: Interactive keepsake guestbook with instant Polaroid camera station and personalized advice note cards.`,
  ];

  // Bespoke Catering Ideas
  const cateringItems = [
    `Welcome Signature Mocktail & Cocktail: "Celebration Blossom" (Blood orange, rosemary infusion, sparkling elderflower & optional prosecco/gin).`,
    `Passed Appetizers: Gourmet truffle & wild mushroom arancini, smoked salmon blinis with dill crème, and heirloom tomato crostini.`,
    `Main Course Service: ${
      type === 'wedding'
        ? 'Dual-protein seated dinner (Braised beef short rib or Herb-crusted sea bass) with wild mushroom risotto vegetarian option.'
        : 'Artisanal culinary grazing stations featuring gourmet sliders, wood-fired flatbreads, and vibrant farm salads.'
    }`,
    `Decadent Dessert Experience: Centerpiece celebratory cake accompanied by mini dessert shot glasses (passionfruit pannacotta & Belgian chocolate mousse).`,
    `Late-Night Comfort Snack: Warm pretzel bites with beer cheese dip or artisan mini sliders served 1 hour before conclusion.`,
  ];

  // Bespoke Entertainment
  const entertainmentItems = [
    `Acoustic Warm-Up: Solo acoustic guitarist or string instrumentalist performing modern indie/pop love ballads as guests arrive.`,
    `Curated Transition Flow: Smooth jazz and warm Neo-Soul background playlist during dinner to keep conversational acoustic levels comfortable.`,
    `Peak Party Set: Dynamic live DJ with wireless mic for toasts, synchronizing dance floor intelligent lighting to peak celebratory hits.`,
    `Interactive Highlight: ${
      type === 'birthday'
        ? 'Trivia milestone roast or curated memory reel video projection on canvas screen.'
        : type === 'community'
        ? 'Open-mic local talent showcase and interactive lawn games (giant Jenga, cornhole, bocce).'
        : 'Couple first dance with low-lying dry ice fog cloud effect followed by anniversary dance for all married couples.'
    }`,
  ];

  // Bespoke Practical Recommendations
  const practicalTips = [
    `Guest Flow Management: Allocate at least 1 bar station per 50 guests to prevent beverage wait bottlenecks during peak arrival.`,
    `Weather & Acoustic Contingency: Secure clear pop-up rain covers or verify venue indoor transition protocol 72 hours prior.`,
    `Power & Cable Safety: Ensure DJ and catering power loads are on separate 15-amp circuits to avoid tripping breakers during key speeches.`,
    `Vendor Meal Protocol: Pre-order hot vendor meals for photographer, videographer, and DJ scheduled right as guests begin dinner.`,
    `Budget Prudence (${costPerGuest ? `$${costPerGuest}/guest target` : 'Balanced'}): Keep a 5% contingency reserve in the miscellaneous category for final week deliveries and tip envelopes.`,
  ];

  return {
    id: 'ai-plan-' + Date.now(),
    generatedAt: new Date().toISOString(),
    isLiveAI: false,
    modelUsed: note ? `Deterministic AI Planner (${note})` : 'Deterministic Offline AI Planner',
    themeTitle,
    themeDescription,
    colorPalette,
    atmosphereAndVibe: atmosphere,
    decorIdeas: {
      title: 'Decor & Floral Styling Concepts',
      iconName: 'Sparkles',
      summary: 'Curated aesthetic blueprint emphasizing elegant lighting, photo-worthy vantage points, and cohesive tablescapes.',
      items: decorItems,
      tips: [
        'Reuse ceremony floral arrangements and arch florals at the reception sweetheart/head table to save up to $800.',
        'Use battery-operated LED wax-dipped taper candles if the venue enforces strict open-flame fire codes.',
      ],
    },
    cateringSuggestions: {
      title: 'Food, Beverage & Menu Architecture',
      iconName: 'Utensils',
      summary: 'Thoughtfully paced culinary menu balancing dietary inclusivity, signature presentation, and lively hospitality.',
      items: cateringItems,
      tips: [
        'Collect guest dietary restrictions on RSVP cards (Vegan, Gluten-Free, Nut Allergies) 3 weeks in advance.',
        'Opting for signature batch cocktails instead of full open liquor bar can trim 20-30% off alcohol costs.',
      ],
    },
    entertainmentSuggestions: {
      title: 'Music, Atmosphere & Guest Experience',
      iconName: 'Music',
      summary: 'Layered acoustic arc guiding guests from welcome greetings to a celebratory dance floor finale.',
      items: entertainmentItems,
      tips: [
        'Provide a "Do Not Play" blacklist to the DJ along with 10 must-play milestone favorites.',
        'Designate a tech coordinator or trusted friend to monitor wireless mic battery and sound checks 30 mins before speeches.',
      ],
    },
    practicalRecommendations: {
      title: 'Logistics, Schedule & Pro Tips',
      iconName: 'Compass',
      summary: 'Actionable event coordinator guidelines ensuring smooth operational execution and zero stress.',
      items: practicalTips,
      tips: [
        'Assign a day-of emergency kit with stain remover, safety pins, phone chargers, pain relief, and mints.',
        'Confirm vendor load-in freight elevator access and parking passes 5 business days in advance.',
      ],
    },
    suggestedBudgetBreakdown: {
      venue: 30,
      catering: 25,
      decorations: 12,
      entertainment: 10,
      photography: 10,
      attire: 5,
      invitations: 4,
      miscellaneous: 4,
    },
  };
}

/**
 * Deterministic chat assistant refinement
 */
export function generateDeterministicChatReply(
  userQuery: string,
  event: EventPlan,
  isFallback: boolean
): ChatMessage {
  const query = userQuery.toLowerCase();
  let text = '';
  const suggestedActions: ChatMessage['suggestedActions'] = [];

  if (query.includes('budget') || query.includes('cost') || query.includes('save') || query.includes('money')) {
    text = `Here are 4 strategic ways to optimize your budget for **${event.name}** without compromising guest experience:

1. **Repurpose Floral & Decor:** Move ceremony arrangements and arch blossoms directly behind the main dining table or photo wall.
2. **Signature Cocktails Over Full Open Bar:** Serve 2 bespoke signature drinks plus beer & wine; this typically reduces beverage spend by 18-25%.
3. **Digital RSVP & Single-Sheet Menus:** Switch to digital RSVP tracking to cut paper stationery, calligraphy, and postage overheads.
4. **Off-Peak or Sunday Scheduling:** Check with **${event.location}** if a Friday, Sunday, or daytime schedule offers reduced venue rental minimums.

Would you like me to adjust any category allocation in your Budget Planner?`;

    suggestedActions.push({
      label: 'Add Budget Buffer Item ($250)',
      actionType: 'add_expense',
      payload: {
        category: 'miscellaneous',
        name: 'Emergency Miscellaneous Buffer',
        estimatedCost: 250,
        notes: 'Recommended emergency fund for unexpected deliveries.',
      },
    });
  } else if (query.includes('food') || query.includes('cater') || query.includes('vegan') || query.includes('drink') || query.includes('menu')) {
    text = `For **${event.name}** (${event.guestCount} guests), here is an inclusive menu structure recommendation:

• **Cocktail Hour Passed Canapes:**
  - Wild mushroom & truffle tartlets (Vegetarian)
  - Citrus-poached shrimp skewers with cilantro crema (Pescatarian, GF)
  - Crispy falafel bites with whipped lemon tahini (Vegan, GF)

• **Main Course Pairing:**
  - Entrée: Slow-braised beef medallions with rosemary roasted baby potatoes.
  - Plant-Based Alternative: Roasted butternut squash steak with pomegranate glaze, wild rice & toasted pine nuts (100% Vegan & GF).

• **Signature Mocktail:**
  - *"Ruby Spritz"*: Pomegranate nectar, fresh rosemary sprig, lime juice, topped with chilled sparkling tonic.`;

    suggestedActions.push({
      label: 'Add Dietary Task to Checklist',
      actionType: 'add_task',
      payload: {
        category: 'catering',
        title: 'Confirm Vegan & Allergen Headcount with Caterer',
        priority: 'high',
        estimatedCost: 0,
        notes: 'Finalize exact counts for gluten-free and vegan guests 14 days before.',
      },
    });
  } else if (query.includes('rain') || query.includes('weather') || query.includes('outdoor')) {
    text = `Planning outdoor events in **${event.location}** requires a robust Weather Action Plan (Plan B):

1. **48-Hour Decision Milestone:** Set a firm cut-off date/time with your venue manager (usually 48 hours prior) to trigger indoor transition or marquee setup.
2. **Marquee & Flooring:** Ensure tent rental agreements include sidewalls and elevated flooring so grass moisture does not seep into the carpet.
3. **Guest Comfort Accents:** Provide a basket of transparent bubble umbrellas for outdoor portrait sessions, and warm fleece shawls if evening temperatures dip.
4. **Sound Protection:** Acoustic wind screens for microphones are essential if speeches occur outdoors in breeze.`;

    suggestedActions.push({
      label: 'Add Weather Milestone (48h Cut-off)',
      actionType: 'add_milestone',
      payload: {
        title: 'Weather Decision Cut-Off & Tent Confirmation',
        description: 'Review 3-day radar forecast with venue manager to enact Plan B if required.',
        category: 'logistics',
      },
    });
  } else if (query.includes('music') || query.includes('song') || query.includes('dj') || query.includes('dance')) {
    text = `Here is a curated musical progression tailored for **${event.name}**:

• **Welcome / Cocktail:** Upbeat Bossa Nova, Acoustic Indie Covers (e.g., Leon Bridges, Norah Jones, Vance Joy).
• **Dinner Transition:** Warm Neo-Soul, Lo-Fi instrumentals, and timeless Motown (keeps sound under 72dB for easy dining conversation).
• **Peak Dance Floor:** High-energy crowd favorites across 90s/2000s throwbacks, contemporary funk, and dance pop.
• **Grand Exit Song:** An anthemic, sing-along track to bring all guests together for sparklers or the final cheer!`;

    suggestedActions.push({
      label: 'Add DJ Playlist Task',
      actionType: 'add_task',
      payload: {
        category: 'entertainment',
        title: 'Submit 15 Must-Play and 5 Do-Not-Play Songs to DJ',
        priority: 'medium',
        estimatedCost: 0,
      },
    });
  } else {
    text = `Thank you for your question regarding **${event.name}**!

Based on your theme (*${event.themeKeywords || 'Classic Celebration'}*) and budget of **$${(event.totalBudget || 0).toLocaleString()}** for **${event.guestCount} guests**:

• **Focus Area:** Maintain seamless timing between arrival, culinary moments, and keynote celebrations.
• **Decor Advice:** Prioritize vertical focal points (like the entrance and backdrop) rather than spreading small items everywhere.
• **Guest Comfort:** Ensure clear directional signage, accessible seating, and hydration stations throughout the venue.

You can ask me to refine specific aspects like cocktail recipes, timeline schedules, centerpiece alternatives, or budget cost-cutting tactics!`;
  }

  return {
    id: 'msg-' + Date.now(),
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text,
    isLiveAI: false,
    suggestedActions,
  };
}

/**
 * Call live Google Gemini API
 */
async function callGeminiForPlan(
  event: EventPlan,
  apiKey: string,
  modelName: string
): Promise<AIPlan> {
  const prompt = `You are Celebrio AI, a world-class luxury celebration and event planning architect.
Analyze the following event details and create a comprehensive, bespoke event plan.
Return ONLY valid JSON matching this schema:
{
  "themeTitle": string,
  "themeDescription": string,
  "colorPalette": [{"name": string, "hex": string}],
  "atmosphereAndVibe": string,
  "decorIdeas": {
    "title": "Decor & Floral Styling Concepts",
    "summary": string,
    "items": string[] (at least 4 detailed concepts),
    "tips": string[] (2 practical tips)
  },
  "cateringSuggestions": {
    "title": "Food, Beverage & Menu Architecture",
    "summary": string,
    "items": string[] (welcome drink, appetizers, main course, dessert, snack),
    "tips": string[] (2 catering tips)
  },
  "entertainmentSuggestions": {
    "title": "Music, Atmosphere & Guest Experience",
    "summary": string,
    "items": string[] (arrival music, dinner sound, peak party, interactive highlight),
    "tips": string[] (2 tips)
  },
  "practicalRecommendations": {
    "title": "Logistics, Schedule & Pro Tips",
    "summary": string,
    "items": string[] (guest flow, weather, power/audio, vendor protocol, budget prudence),
    "tips": string[] (2 tips)
  },
  "suggestedBudgetBreakdown": {
    "venue": number,
    "catering": number,
    "decorations": number,
    "entertainment": number,
    "photography": number,
    "attire": number,
    "invitations": number,
    "miscellaneous": number
  }
}

Event Details:
- Name: ${event.name}
- Type: ${event.type}
- Date: ${event.date}
- Location: ${event.location}
- Venue Type: ${event.venueType || 'flexible'}
- Guest Count: ${event.guestCount}
- Total Budget: $${event.totalBudget}
- Theme & Vibe Keywords: ${event.themeKeywords || 'elegant celebration'}
- Formality: ${event.preferences?.formality || 'semi-formal'}
- Special Dietary/Music Preferences: ${event.preferences?.dietaryNotes || 'none'} / ${event.preferences?.musicPreference || 'diverse'}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const json = await response.json();
  const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Empty response from Gemini API');
  }

  const parsed = JSON.parse(textContent);

  return {
    id: 'ai-plan-' + Date.now(),
    generatedAt: new Date().toISOString(),
    isLiveAI: true,
    modelUsed: `Gemini Live (${modelName})`,
    themeTitle: parsed.themeTitle || 'Curated Celebration',
    themeDescription: parsed.themeDescription || '',
    colorPalette: parsed.colorPalette || [
      { name: 'Warm Terracotta', hex: '#D97736' },
      { name: 'Ivory Cream', hex: '#FAF7F2' },
      { name: 'Rose Gold', hex: '#C59B27' },
      { name: 'Deep Espresso', hex: '#2B2D42' },
    ],
    atmosphereAndVibe: parsed.atmosphereAndVibe || '',
    decorIdeas: {
      title: parsed.decorIdeas?.title || 'Decor & Floral Styling Concepts',
      iconName: 'Sparkles',
      summary: parsed.decorIdeas?.summary || '',
      items: parsed.decorIdeas?.items || [],
      tips: parsed.decorIdeas?.tips || [],
    },
    cateringSuggestions: {
      title: parsed.cateringSuggestions?.title || 'Food, Beverage & Menu Architecture',
      iconName: 'Utensils',
      summary: parsed.cateringSuggestions?.summary || '',
      items: parsed.cateringSuggestions?.items || [],
      tips: parsed.cateringSuggestions?.tips || [],
    },
    entertainmentSuggestions: {
      title: parsed.entertainmentSuggestions?.title || 'Music, Atmosphere & Guest Experience',
      iconName: 'Music',
      summary: parsed.entertainmentSuggestions?.summary || '',
      items: parsed.entertainmentSuggestions?.items || [],
      tips: parsed.entertainmentSuggestions?.tips || [],
    },
    practicalRecommendations: {
      title: parsed.practicalRecommendations?.title || 'Logistics, Schedule & Pro Tips',
      iconName: 'Compass',
      summary: parsed.practicalRecommendations?.summary || '',
      items: parsed.practicalRecommendations?.items || [],
      tips: parsed.practicalRecommendations?.tips || [],
    },
    suggestedBudgetBreakdown: parsed.suggestedBudgetBreakdown || {
      venue: 30,
      catering: 25,
      decorations: 12,
      entertainment: 10,
      photography: 10,
      attire: 5,
      invitations: 4,
      miscellaneous: 4,
    },
  };
}

async function callGeminiForChat(
  userQuery: string,
  event: EventPlan,
  chatHistory: ChatMessage[],
  apiKey: string,
  modelName: string
): Promise<ChatMessage> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const conversationHistory = chatHistory.slice(-6).map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  const systemInstruction = `You are Celebrio AI, a sophisticated luxury event planning concierge assisting the user in refining their plan for: "${event.name}" (${event.type}, ${event.guestCount} guests, $${event.totalBudget} budget, location: ${event.location}).
Keep your replies warm, practical, elegant, and directly actionable.
Where appropriate, format with clear bullet points. Offer concrete ideas for menus, decor, logistics, or budget balancing.`;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `SYSTEM CONTEXT: ${systemInstruction}\n\nUser Question: ${userQuery}`,
        },
      ],
    },
  ];

  if (conversationHistory.length > 0) {
    contents.unshift(...conversationHistory);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini chat error: ${response.statusText}`);
  }

  const json = await response.json();
  const replyText = json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from model.';

  return {
    id: 'msg-' + Date.now(),
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: replyText,
    isLiveAI: true,
  };
}
