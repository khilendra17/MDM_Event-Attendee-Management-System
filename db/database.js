const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.join(__dirname, 'eventhorizon.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      venue TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK(capacity > 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      ticket_type TEXT NOT NULL CHECK(ticket_type IN ('General', 'VIP', 'Student')),
      event_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(email, event_id)
    );
  `);

  // Auto seed if empty and not in test environment
  if (process.env.NODE_ENV !== 'test') {
    const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    if (eventCount === 0) {
      seedDb();
    }
  }
}

function seedDb() {
  const insertEvent = db.prepare(`
    INSERT INTO events (name, date, venue, capacity)
    VALUES (?, ?, ?, ?)
  `);

  const insertAttendee = db.prepare(`
    INSERT INTO attendees (name, email, ticket_type, event_id)
    VALUES (?, ?, ?, ?)
  `);

  const seedTransaction = db.transaction(() => {
    const e1 = insertEvent.run('Tech Innovation Summit 2026', '2026-11-15', 'Silicon Hall, Grand Convention Center', 50);
    const e2 = insertEvent.run('AI & Web3 Developers Meetup', '2026-10-25', 'Cyber Tower 4th Floor, Tech Park', 30);
    const e3 = insertEvent.run('Design Systems & UX Workshop', '2026-12-01', 'Creative Loft Studio B', 15);
    const e4 = insertEvent.run('Cloud Architecture Masterclass', '2026-11-28', 'Virtual Auditorium Alpha', 100);

    // Seed attendees for Tech Summit
    insertAttendee.run('Elena Vance', 'elena.vance@quantumtech.io', 'VIP', e1.lastInsertRowid);
    insertAttendee.run('Marcus Brody', 'mbrody@nexus.org', 'General', e1.lastInsertRowid);
    insertAttendee.run('Sofia Chen', 'sofia.chen@mit.edu', 'Student', e1.lastInsertRowid);

    // Seed attendees for AI Meetup
    insertAttendee.run('Alex Mercer', 'alex.mercer@deepbrain.ai', 'VIP', e2.lastInsertRowid);
    insertAttendee.run('David K.', 'david.k@devnet.co', 'General', e2.lastInsertRowid);

    // Seed attendees for Design Workshop
    insertAttendee.run('Chloe Zhao', 'chloe@uicraft.design', 'General', e3.lastInsertRowid);
  });

  seedTransaction();
}

initDb();

module.exports = db;
