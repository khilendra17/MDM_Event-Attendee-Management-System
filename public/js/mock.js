/**
 * EventHorizon Mock Data & Offline Fallback Provider
 * Ensures zero-downtime demonstration with "Demo Mode" fallback
 */

const EventHorizonMock = {
  isDemoMode: false,

  stats: {
    total_events: 4,
    total_attendees: 18,
    total_capacity: 120,
    total_seats_left: 102,
    upcoming_events: 4
  },

  events: [
    {
      id: 1,
      name: "Quantum Computing & AI Summit 2026",
      date: "2026-11-15",
      venue: "Hyperion Dome, Silicon Bay",
      capacity: 50,
      registered_count: 12,
      seats_left: 38
    },
    {
      id: 2,
      name: "Cybersecurity & Web3 Developers Meetup",
      date: "2026-10-28",
      venue: "Nexus Tower Loft 4",
      capacity: 20,
      registered_count: 18,
      seats_left: 2
    },
    {
      id: 3,
      name: "Design Systems & Holographic UX Workshop",
      date: "2026-12-05",
      venue: "Creative Innovation Studio",
      capacity: 15,
      registered_count: 15,
      seats_left: 0
    },
    {
      id: 4,
      name: "Autonomous Robotics & Edge AI Expo",
      date: "2026-11-20",
      venue: "Main Pavilion Alpha",
      capacity: 35,
      registered_count: 5,
      seats_left: 30
    }
  ],

  attendees: [
    {
      id: 101,
      name: "Elena Vance",
      email: "elena.vance@quantumtech.io",
      ticket_type: "VIP",
      event_id: 1,
      event_name: "Quantum Computing & AI Summit 2026",
      event_date: "2026-11-15",
      created_at: "2026-10-08T10:00:00Z"
    },
    {
      id: 102,
      name: "Marcus Brody",
      email: "mbrody@nexus.org",
      ticket_type: "General",
      event_id: 2,
      event_name: "Cybersecurity & Web3 Developers Meetup",
      event_date: "2026-10-28",
      created_at: "2026-10-08T11:30:00Z"
    },
    {
      id: 103,
      name: "Sofia Chen",
      email: "sofia.chen@mit.edu",
      ticket_type: "Student",
      event_id: 3,
      event_name: "Design Systems & Holographic UX Workshop",
      event_date: "2026-12-05",
      created_at: "2026-10-08T14:15:00Z"
    },
    {
      id: 104,
      name: "Alex Mercer",
      email: "alex.mercer@deepbrain.ai",
      ticket_type: "VIP",
      event_id: 1,
      event_name: "Quantum Computing & AI Summit 2026",
      event_date: "2026-11-15",
      created_at: "2026-10-08T15:45:00Z"
    }
  ],

  enableDemoMode() {
    this.isDemoMode = true;
    const badge = document.getElementById('demo-mode-badge');
    if (badge) badge.style.display = 'inline-flex';
  }
};

window.EventHorizonMock = EventHorizonMock;
