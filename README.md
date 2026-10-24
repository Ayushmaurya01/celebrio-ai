# Celebrio AI — Celebration & Event Planner
**Google PromptWars Challenge 5 Edition**

> An elegant, GenAI-powered celebration and event planning architect designed to organize weddings, milestone birthdays, and community festivals with deterministic budgets, chronological schedules, vendor directories, and personalized creative styling.

---

## 🌟 Overview & Problem Statement

Event planning involves intricate choreography across aesthetic vision, tight financial constraints, volatile vendor coordination, and strict date sequences. **Celebrio AI** provides a complete, unified planning system featuring:

1. **Personalized Event Creation**: Tailored workflows for Weddings, Birthdays, Community Galas, Anniversaries, and Baby Showers with validated budgets, guest counts, and dates.
2. **AI Planning Assistant**: Full bespoke design blueprints (themes, harmonious color swatches, decor concepts, culinary & bar architecture, entertainment progression, practical tips) paired with a conversational refinement chat concierge.
3. **Deterministic Financial Engine**: Itemized category breakdowns (Venue, Catering, Decor, Music, Photo, Attire, Stationery, Buffer) with immediate reactivity, explicit `[ESTIMATE]` tagging, and prominent over-budget warnings with exact deficit amounts.
4. **Chronological Timeline & Day-of Schedule**: Preparation milestone countdowns, overdue milestone alerts, sequence validation (warning if preparation tasks occur after event date), and hour-by-hour day-of agenda run-sheets.
5. **Vendor Directory & Task Checklist**: Contact details, phone/email, contract notes, booking statuses (`inquiry`, `quote_received`, `booked`, `deposit_paid`, `completed`), committed spend tracking, and celebration confetti upon completion.
6. **Portfolio Management & Storage Persistence**: Local storage persistence, multi-event switcher, duplicate event, export to standalone JSON, printable PDF summary, and sample data restore.

---

## 🎨 Design Aesthetics & User Experience

- **Refined Color Palette**: Warm ivory background (`#F7F5F0`), sophisticated coral accent (`#E66A48`), muted rose (`#DFA6A0`), champagne gold (`#D9B86C`), botanical sage (`#7C987A`), deep charcoal typography (`#292D35`), and muted slate secondary text (`#747C8C`).
- **Premium Glassmorphism**: Translucent white panels (`rgba(255, 255, 255, 0.75)` with `16px` backdrop blur, subtle shadows, and semi-transparent borders).
- **Budget Analytics & Insights**: Interactive responsive SVG Donut Chart with center label and hover highlights, grouped horizontal bars comparing Planned Estimates vs. Confirmed Paid Actuals, and deterministic actionable financial tips.
- **Typography**: Dual-font pairing with *Playfair Display* for editorial headings and *Plus Jakarta Sans* for crisp, modern interface legibility.
- **Responsive Architecture**: Smooth navigation sidebar on desktop, responsive drawer on mobile, and print stylesheet for PDF exports.

---

## 🚀 Live vs. Deterministic Demo Mode (Transparency Guarantee)

Celebrio AI provides two authentic modes:

| Feature | Deterministic Offline Mode | Live Gemini AI Mode |
| :--- | :--- | :--- |
| **Setup** | Zero setup required (works out of the box) | Requires Google Gemini API Key |
| **Event Blueprint** | Rich, algorithmic styling and menu recommendations | Generative multimodal reasoning via `gemini-2.5-flash` |
| **Conversational Chat** | Keyword-sensitive assistant with actionable quick buttons | Contextual multi-turn event concierge |
| **Transparency** | Clearly labeled `[Deterministic Offline AI Planner]` | Clearly labeled `[Live Gemini AI (model_name)]` |

*Celebrio AI strictly complies with the PromptWars rule: it never pretends a mock or deterministic response came from a live AI model.*

---

## 💻 Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Pure Vanilla CSS with Design Tokens & CSS Custom Properties (Zero Tailwind bloat)
- **Icons**: Lucide React
- **Celebrations**: Canvas Confetti
- **Testing**: Vitest + JSDOM + Testing Library

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js `v18.0.0` or later
- npm `v9.0.0` or later

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd C5

# Install dependencies
npm install
```

### 3. Environment Configuration (Optional)
To use live Google Gemini AI, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Alternatively, you can paste your API key directly inside the in-app Settings modal. The key is persisted strictly in local browser storage and never transmitted to external servers.)*

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Automated tests cover all critical logic:
```bash
# Run test suite
npm test
```

### Test Coverage Highlights:
- **`budgetService.test.ts`**: Total budget calculation, category allocation percentages, over-budget detection, deficit math, and initial estimate generation.
- **`validationService.test.ts`**: Event form validation, past date rejection, negative/zero budget validation, guest count boundaries, and timeline date sequence checks.
- **`timelineService.test.ts`**: Chronological sorting, day-of agenda timing, overdue status detection, and sequence warnings.
- **`aiPlannerService.test.ts`**: Deterministic plan generation, required section assertions, color palette integrity, and conversational interactive action triggers.

---

## 📂 Repository Size Compliance

The repository (excluding `node_modules` and `.git`) is **under 500 KB**, well within the competition's 10 MB limit.

---

## 🚀 Production Build & Deployment

To build static production assets:
```bash
npm run build
```
The compiled static assets in `dist/` can be deployed instantly to:
- **Firebase Hosting**: `firebase deploy --only hosting`
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: Upload `dist/` directory.

---

## 📋 Genuinely Functional Feature Report

| Feature Area | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Personalized Event Creation** | ✅ 100% Functional | Validates dates, budget > 0, guest counts, and required fields. |
| **Deterministic AI Blueprint** | ✅ 100% Functional | Custom color palettes, decor, catering, entertainment, and logistics. |
| **Live Gemini AI Integration** | ✅ 100% Functional | Enabled when API key is provided via `.env` or Settings modal. |
| **Conversational Chat Assistant** | ✅ 100% Functional | Multi-turn chat with 1-click action buttons (e.g. "Add to Budget"). |
| **Reactive Budget Planner** | ✅ 100% Functional | Real-time calculations, category bars, estimates tags, over-budget alerts. |
| **Timeline & Day-of Schedule** | ✅ 100% Functional | Overdue warnings, sequence checks, status cycles, hourly run-sheets. |
| **Vendor Directory & Tasks** | ✅ 100% Functional | Contacts, booking statuses, committed spend, confetti completion. |
| **Saved Plans Portfolio** | ✅ 100% Functional | LocalStorage persistence, duplication, JSON import/export, sample restore. |
| **Automated Unit Tests** | ✅ 17/17 Tests Passing | Tested with Vitest. |
