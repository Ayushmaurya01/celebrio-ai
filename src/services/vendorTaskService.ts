import { VendorTask, EventType, VendorTaskProgress } from '../types';
import { subtractDays } from '../utils/dateUtils';

export type { VendorTaskProgress };

export function calculateVendorTaskProgress(tasks: VendorTask[]): VendorTaskProgress {
  const total = tasks.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0,
      pendingCount: 0,
      totalCommittedSpend: 0,
    };
  }

  const completed = tasks.filter((t) => t.completed).length;
  const pendingCount = total - completed;
  const percentage = Math.round((completed / total) * 100);
  
  // Committed spend is for booked or completed vendors
  const totalCommittedSpend = tasks
    .filter((t) => ['booked', 'deposit_paid', 'completed'].includes(t.bookingStatus))
    .reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

  return {
    total,
    completed,
    percentage,
    pendingCount,
    totalCommittedSpend,
  };
}

export function generateInitialVendorTasks(
  eventDateStr: string,
  eventType: EventType
): VendorTask[] {

  if (eventType === 'wedding') {
    return [
      {
        id: 'vt-1',
        title: 'Book Ceremony & Banquet Venue',
        category: 'venue',
        vendorName: 'Villa Bellissima Estates',
        contactPerson: 'Sophia Rossi',
        phone: '+1 (555) 234-8890',
        email: 'events@villabellissima.com',
        notes: 'Deposit paid for terrace and banquet hall; site manager assigned.',
        bookingStatus: 'booked',
        estimatedCost: 12000,
        dueDate: subtractDays(eventDateStr, 180),
        priority: 'high',
        completed: true,
      },
      {
        id: 'vt-2',
        title: 'Secure Lead Photographer & Videographer',
        category: 'photography',
        vendorName: 'Lumière Storytelling Studios',
        contactPerson: 'Marcus Vance',
        phone: '+1 (555) 789-3321',
        email: 'marcus@lumierephoto.art',
        notes: 'Includes 10 hours coverage, 2 shooters, drone aerials and digital gallery.',
        bookingStatus: 'deposit_paid',
        estimatedCost: 4500,
        dueDate: subtractDays(eventDateStr, 120),
        priority: 'high',
        completed: true,
      },
      {
        id: 'vt-3',
        title: 'Catering Tasting & Menu Finalization',
        category: 'catering',
        vendorName: 'Epicurean Feast Catering Co.',
        contactPerson: 'Chef Elena Morales',
        phone: '+1 (555) 441-9922',
        email: 'info@epicureanfeast.com',
        notes: 'Reviewing 3 sample menus: Mediterranean, French Bistro, Farm-to-Table.',
        bookingStatus: 'quote_received',
        estimatedCost: 9500,
        dueDate: subtractDays(eventDateStr, 75),
        priority: 'high',
        completed: false,
      },
      {
        id: 'vt-4',
        title: 'Florist Consultation & Centerpiece Sample',
        category: 'decorations',
        vendorName: 'Botanica Bloom Atelier',
        contactPerson: 'Julian Thorne',
        phone: '+1 (555) 902-1144',
        email: 'julian@botanicablooms.com',
        notes: 'Need quote for ivory roses, blush hydrangeas, and ceremony arch framing.',
        bookingStatus: 'inquiry',
        estimatedCost: 3800,
        dueDate: subtractDays(eventDateStr, 60),
        priority: 'medium',
        completed: false,
      },
      {
        id: 'vt-5',
        title: 'Contract Live Band & Ceremony Strings',
        category: 'entertainment',
        vendorName: 'Harbor Symphony & Velvet Groove',
        contactPerson: 'David Chen',
        phone: '+1 (555) 667-1289',
        email: 'bookings@velvetgroove.live',
        notes: 'Acoustic duo for ceremony + 6-piece reception showband.',
        bookingStatus: 'inquiry',
        estimatedCost: 4200,
        dueDate: subtractDays(eventDateStr, 60),
        priority: 'medium',
        completed: false,
      },
      {
        id: 'vt-6',
        title: 'Stationery & Custom Calligraphy Orders',
        category: 'invitations',
        vendorName: 'Paper & Gold Press',
        contactPerson: 'Chloe Laurent',
        phone: '+1 (555) 310-7765',
        email: 'hello@papergoldpress.com',
        notes: 'Wax seals, cotton paper, gold foil stamping.',
        bookingStatus: 'inquiry',
        estimatedCost: 1100,
        dueDate: subtractDays(eventDateStr, 50),
        priority: 'low',
        completed: false,
      },
    ];
  } else if (eventType === 'birthday') {
    return [
      {
        id: 'vt-1',
        title: 'Reserve Rooftop Lounge Space',
        category: 'venue',
        vendorName: 'Skyline Terrace Lounge',
        contactPerson: 'Alex Rivera',
        phone: '+1 (555) 887-2201',
        email: 'private@skylineterrace.bar',
        notes: 'Minimum spend includes open bar and private bartender.',
        bookingStatus: 'booked',
        estimatedCost: 2800,
        dueDate: subtractDays(eventDateStr, 30),
        priority: 'high',
        completed: true,
      },
      {
        id: 'vt-2',
        title: 'Book DJ & Audio Lighting Rig',
        category: 'entertainment',
        vendorName: 'DJ Neon Pulse',
        contactPerson: 'Leo Sparks',
        phone: '+1 (555) 432-6789',
        email: 'booking@djneonpulse.com',
        notes: 'Requested 90s & 2000s throwback dance set + haze machine.',
        bookingStatus: 'deposit_paid',
        estimatedCost: 950,
        dueDate: subtractDays(eventDateStr, 20),
        priority: 'high',
        completed: false,
      },
      {
        id: 'vt-3',
        title: 'Order Specialty Birthday Cake',
        category: 'catering',
        vendorName: 'Sweet Couture Bakery',
        contactPerson: 'Marie Dubois',
        phone: '+1 (555) 912-4455',
        email: 'orders@sweetcouture.com',
        notes: 'Two-tier salted caramel and Belgian dark chocolate drip cake.',
        bookingStatus: 'quote_received',
        estimatedCost: 350,
        dueDate: subtractDays(eventDateStr, 15),
        priority: 'medium',
        completed: false,
      },
      {
        id: 'vt-4',
        title: 'Balloon Sculpting & Photo Backdrop Hire',
        category: 'decorations',
        vendorName: 'Pop & Posh Decor Co.',
        contactPerson: 'Kendra Hall',
        phone: '+1 (555) 601-3344',
        email: 'kendra@popposhdecor.com',
        notes: 'Organic balloon garland with custom warm-gold neon sign.',
        bookingStatus: 'inquiry',
        estimatedCost: 750,
        dueDate: subtractDays(eventDateStr, 10),
        priority: 'medium',
        completed: false,
      },
    ];
  } else {
    // Community
    return [
      {
        id: 'vt-1',
        title: 'Secure Park Grounds & Municipal Permit',
        category: 'venue',
        vendorName: 'City Parks & Recreation Dept',
        contactPerson: 'Janice Miller',
        phone: '+1 (555) 300-1100',
        email: 'permits@cityparks.gov',
        notes: 'Permit filed for 500 attendees, waste management bond included.',
        bookingStatus: 'booked',
        estimatedCost: 1200,
        dueDate: subtractDays(eventDateStr, 45),
        priority: 'high',
        completed: true,
      },
      {
        id: 'vt-2',
        title: 'Coordinate Food Truck Vendors',
        category: 'catering',
        vendorName: 'Metro Food Trucks Collective',
        contactPerson: 'Carlos Santana',
        phone: '+1 (555) 777-3310',
        email: 'fleet@metrofoodtrucks.org',
        notes: '4 trucks: Tacos, Woodfire Pizza, Vegan Bowls, Gelato.',
        bookingStatus: 'quote_received',
        estimatedCost: 2400,
        dueDate: subtractDays(eventDateStr, 30),
        priority: 'high',
        completed: false,
      },
      {
        id: 'vt-3',
        title: 'Rent Stage, Marquees & PA Audio Rig',
        category: 'entertainment',
        vendorName: 'SoundWave Staging & Audio',
        contactPerson: 'Patrick O’Connor',
        phone: '+1 (555) 819-0022',
        email: 'rentals@soundwavestaging.com',
        notes: 'Includes wireless microphones, monitors, and rain cover.',
        bookingStatus: 'quote_received',
        estimatedCost: 1800,
        dueDate: subtractDays(eventDateStr, 25),
        priority: 'medium',
        completed: false,
      },
      {
        id: 'vt-4',
        title: 'Eco-Waste Stations & Restroom Units',
        category: 'miscellaneous',
        vendorName: 'CleanGreen Event Services',
        contactPerson: 'Samira Patel',
        phone: '+1 (555) 299-4455',
        email: 'contact@cleangreen.io',
        notes: 'Recycling, compost bins and 4 portable luxury restroom units.',
        bookingStatus: 'inquiry',
        estimatedCost: 950,
        dueDate: subtractDays(eventDateStr, 20),
        priority: 'medium',
        completed: false,
      },
    ];
  }
}
