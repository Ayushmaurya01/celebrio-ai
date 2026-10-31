import { TimelineMilestone, EventType, DateSequenceIssue } from '../types';
import { subtractDays, getDaysUntilEvent, isValidDateString } from '../utils/dateUtils';

export type { DateSequenceIssue };

export function isMilestoneOverdue(milestone: TimelineMilestone, todayDateStr?: string): boolean {
  if (milestone.status === 'completed') return false;
  if (!milestone.targetDate) return false;

  const refDate = todayDateStr ? new Date(todayDateStr + 'T00:00:00') : undefined;
  const daysUntil = getDaysUntilEvent(milestone.targetDate, refDate);
  if (daysUntil === null) return false;

  return daysUntil < 0;
}

export function sortMilestonesChronologically(milestones: TimelineMilestone[]): TimelineMilestone[] {
  return [...milestones].sort((a, b) => {
    // Separate preparation milestones and day-of agenda if needed, or sort all by targetDate then time
    const dateComparison = a.targetDate.localeCompare(b.targetDate);
    if (dateComparison !== 0) return dateComparison;

    // If dates are identical, day-of agenda items with time come in time order
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });
}

export function checkDateSequenceIssues(
  milestones: TimelineMilestone[],
  eventDate: string
): DateSequenceIssue[] {
  const issues: DateSequenceIssue[] = [];
  const eventD = new Date(eventDate + 'T00:00:00');

  milestones.forEach((m) => {
    if (!m.targetDate) return;
    const mDate = new Date(m.targetDate + 'T00:00:00');

    if (!m.isDayOfAgenda && mDate > eventD) {
      issues.push({
        milestoneId: m.id,
        issue: 'Scheduled after event date.',
      });
    }
  });

  return issues;
}

export function generateInitialMilestones(
  eventDateStr: string,
  eventType: EventType
): TimelineMilestone[] {
  if (!isValidDateString(eventDateStr)) {
    return [];
  }

  const sameDay = eventDateStr;

  if (eventType === 'wedding') {
    return [
      {
        id: 'm-1',
        title: 'Lock Venue & Set Date',
        description: 'Tour and sign contract with ceremony and reception venue; pay initial deposit.',
        category: 'venue',
        targetDate: subtractDays(eventDateStr, 180),
        status: 'completed',
        isDayOfAgenda: false,
      },
      {
        id: 'm-2',
        title: 'Hire Key Vendors (Photo, Video, Catering)',
        description: 'Interview and book lead photographer, videographer, and primary caterer.',
        category: 'vendors',
        targetDate: subtractDays(eventDateStr, 120),
        status: 'in_progress',
        isDayOfAgenda: false,
      },
      {
        id: 'm-3',
        title: 'Mail Save-the-Dates & Set Registry',
        description: 'Send digital or physical save-the-date cards to guest list and launch event website.',
        category: 'invitations',
        targetDate: subtractDays(eventDateStr, 90),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-4',
        title: 'Attire Selection & Floral Concept',
        description: 'Finalize wedding dress/suit fittings, bridal party attire, and florist consultation.',
        category: 'decor',
        targetDate: subtractDays(eventDateStr, 60),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-5',
        title: 'Menu Tasting & Formal Invitations',
        description: 'Conduct food and wine tasting; send official formal invitations with RSVP deadline.',
        category: 'invitations',
        targetDate: subtractDays(eventDateStr, 45),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-6',
        title: 'Finalize Seating Chart & Vendor Timings',
        description: 'Confirm final headcount with caterer, build table layout, and distribute run-sheet.',
        category: 'logistics',
        targetDate: subtractDays(eventDateStr, 14),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-7',
        title: 'Rehearsal Dinner & Final Walkthrough',
        description: 'Run through ceremony processional and hand over day-of coordinator binder.',
        category: 'general',
        targetDate: subtractDays(eventDateStr, 1),
        status: 'pending',
        isDayOfAgenda: false,
      },
      // Day of Agenda
      {
        id: 'm-day-1',
        title: 'Hair, Makeup & Getting Ready',
        description: 'Bridal suite preparations, champagne toast, and photographer arrives for details.',
        category: 'day_of',
        targetDate: sameDay,
        time: '09:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-2',
        title: 'First Look & Couple Portraits',
        description: 'Quiet romantic photo session before guests arrive.',
        category: 'day_of',
        targetDate: sameDay,
        time: '14:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-3',
        title: 'Ceremony Begins',
        description: 'Guests seated, processional walk, vows and ring exchange.',
        category: 'day_of',
        targetDate: sameDay,
        time: '16:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-4',
        title: 'Cocktail Hour & Passed Canapes',
        description: 'Acoustic music plays while couple finishes group family photos.',
        category: 'day_of',
        targetDate: sameDay,
        time: '17:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-5',
        title: 'Grand Entrance & Plated Dinner',
        description: 'Welcome speeches, toast, and three-course dinner service.',
        category: 'day_of',
        targetDate: sameDay,
        time: '18:30',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-6',
        title: 'First Dance & Dance Floor Opens',
        description: 'Cake cutting followed by high-energy party music and open bar.',
        category: 'day_of',
        targetDate: sameDay,
        time: '20:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
    ];
  } else if (eventType === 'birthday') {
    return [
      {
        id: 'm-1',
        title: 'Choose Theme & Secure Venue',
        description: 'Lock in party theme concept and deposit for venue or private dining room.',
        category: 'venue',
        targetDate: subtractDays(eventDateStr, 45),
        status: 'completed',
        isDayOfAgenda: false,
      },
      {
        id: 'm-2',
        title: 'Send Invitations & Collect RSVPs',
        description: 'Send digital animated invites and track food allergy responses.',
        category: 'invitations',
        targetDate: subtractDays(eventDateStr, 30),
        status: 'in_progress',
        isDayOfAgenda: false,
      },
      {
        id: 'm-3',
        title: 'Order Custom Cake & Food Catering',
        description: 'Order signature themed birthday cake and confirm food platters.',
        category: 'vendors',
        targetDate: subtractDays(eventDateStr, 20),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-4',
        title: 'Purchase Decor & Props',
        description: 'Procure balloon installation, photo booth backdrop, lighting, and neon sign.',
        category: 'decor',
        targetDate: subtractDays(eventDateStr, 10),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-5',
        title: 'Finalize Playlist & Games Schedule',
        description: 'Compile guest playlist, prepare party games, and brief DJ / speaker setup.',
        category: 'logistics',
        targetDate: subtractDays(eventDateStr, 3),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-day-1',
        title: 'Venue Setup & Balloon Installation',
        description: 'Decorate tables, position cake table, test lighting and audio.',
        category: 'day_of',
        targetDate: sameDay,
        time: '16:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-2',
        title: 'Guests Arrive & Welcome Drinks',
        description: 'Cocktail service starts, background beats, Polaroid guestbook signing.',
        category: 'day_of',
        targetDate: sameDay,
        time: '18:30',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-3',
        title: 'Cake Cutting & Birthday Toast',
        description: 'Candles lit, birthday song, celebratory speech, and dessert served.',
        category: 'day_of',
        targetDate: sameDay,
        time: '20:30',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-4',
        title: 'Dance Floor & Late Night Snacks',
        description: 'DJ turn-up and midnight pizza / sliders served.',
        category: 'day_of',
        targetDate: sameDay,
        time: '21:30',
        status: 'pending',
        isDayOfAgenda: true,
      },
    ];
  } else {
    // Community & general celebrations
    return [
      {
        id: 'm-1',
        title: 'Permits, Council Approvals & Venue Access',
        description: 'Submit city park/hall permits, noise exemptions, and public liability insurance.',
        category: 'venue',
        targetDate: subtractDays(eventDateStr, 60),
        status: 'completed',
        isDayOfAgenda: false,
      },
      {
        id: 'm-2',
        title: 'Vendor & Stallholder Registration',
        description: 'Invite local food trucks, artisanal craft stalls, and community performers.',
        category: 'vendors',
        targetDate: subtractDays(eventDateStr, 45),
        status: 'in_progress',
        isDayOfAgenda: false,
      },
      {
        id: 'm-3',
        title: 'Community Outreach & Flyers',
        description: 'Distribute posters, publish social media campaign, and alert neighborhood associations.',
        category: 'invitations',
        targetDate: subtractDays(eventDateStr, 30),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-4',
        title: 'Safety, Waste Management & First Aid',
        description: 'Order portaloos, recycling bins, volunteer vests, and schedule St John First Aid.',
        category: 'logistics',
        targetDate: subtractDays(eventDateStr, 14),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-5',
        title: 'Volunteer Briefing & Equipment Delivery',
        description: 'Conduct coordinator walk-through, deliver PA audio system, tables, and gazebos.',
        category: 'general',
        targetDate: subtractDays(eventDateStr, 2),
        status: 'pending',
        isDayOfAgenda: false,
      },
      {
        id: 'm-day-1',
        title: 'Site Bump-In & Stall Setup',
        description: 'Volunteers assemble gazebos, sound checks on stage, food truck parking.',
        category: 'day_of',
        targetDate: sameDay,
        time: '08:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-2',
        title: 'Official Welcome & Festival Opening',
        description: 'Community leader opening speech, ribbon cutting, and morning acoustic set.',
        category: 'day_of',
        targetDate: sameDay,
        time: '10:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-3',
        title: 'Peak Activities & Stage Performances',
        description: 'Cultural dance performances, children’s workshops, and food competitions.',
        category: 'day_of',
        targetDate: sameDay,
        time: '13:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
      {
        id: 'm-day-4',
        title: 'Closing Ceremony & Site Bump-Out',
        description: 'Thank-you address, raffle draw, litter sweep, and equipment pack-down.',
        category: 'day_of',
        targetDate: sameDay,
        time: '17:00',
        status: 'pending',
        isDayOfAgenda: true,
      },
    ];
  }
}
