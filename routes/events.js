const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { validateEvent, validateAttendee } = require('../middleware/validate');

// POST /api/events - Create new event
router.post('/', validateEvent, (req, res, next) => {
  try {
    const { name, date, venue, capacity } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO events (name, date, venue, capacity)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(name, date, venue, capacity);
    const newEvent = db.prepare(`
      SELECT e.*, 0 as registered_count, e.capacity as seats_left
      FROM events e WHERE e.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Event created successfully'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/events - List all events with seat counts
router.get('/', (req, res, next) => {
  try {
    const q = req.query.q ? `%${req.query.q.trim()}%` : '%';

    const stmt = db.prepare(`
      SELECT 
        e.id, 
        e.name, 
        e.date, 
        e.venue, 
        e.capacity, 
        e.created_at,
        COUNT(a.id) AS registered_count,
        (e.capacity - COUNT(a.id)) AS seats_left
      FROM events e
      LEFT JOIN attendees a ON e.id = a.event_id
      WHERE e.name LIKE ? OR e.venue LIKE ?
      GROUP BY e.id
      ORDER BY e.date ASC, e.id DESC
    `);

    const events = stmt.all(q, q);

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id - Get specific event with its attendees
router.get('/:id', (req, res, next) => {
  try {
    const eventId = Number(req.params.id);

    const event = db.prepare(`
      SELECT 
        e.id, 
        e.name, 
        e.date, 
        e.venue, 
        e.capacity, 
        e.created_at,
        COUNT(a.id) AS registered_count,
        (e.capacity - COUNT(a.id)) AS seats_left
      FROM events e
      LEFT JOIN attendees a ON e.id = a.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `).get(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const attendees = db.prepare(`
      SELECT id, name, email, ticket_type, created_at
      FROM attendees
      WHERE event_id = ?
      ORDER BY created_at DESC
    `).all(eventId);

    event.attendees = attendees;

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/:id - Delete an event (cascades to attendees)
router.delete('/:id', (req, res, next) => {
  try {
    const eventId = Number(req.params.id);

    const event = db.prepare('SELECT id, name FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(eventId);

    res.status(200).json({
      success: true,
      message: `Event "${event.name}" and all associated attendees deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/register - Register attendee for an event
router.post('/:id/register', validateAttendee, (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const { name, email, ticket_type } = req.body;

    // Execute within a SQLite transaction to prevent race conditions
    const registerTx = db.transaction(() => {
      // 1. Verify event exists and check capacity
      const event = db.prepare(`
        SELECT e.id, e.name, e.capacity, COUNT(a.id) as registered_count
        FROM events e
        LEFT JOIN attendees a ON e.id = a.event_id
        WHERE e.id = ?
        GROUP BY e.id
      `).get(eventId);

      if (!event) {
        return { status: 404, error: 'Event not found' };
      }

      if (event.registered_count >= event.capacity) {
        return { status: 409, error: 'Event is full' };
      }

      // 2. Check duplicate registration
      const existing = db.prepare(`
        SELECT id FROM attendees
        WHERE event_id = ? AND LOWER(email) = ?
      `).get(eventId, email.toLowerCase());

      if (existing) {
        return { status: 409, error: 'This email is already registered for this event' };
      }

      // 3. Insert attendee
      const insert = db.prepare(`
        INSERT INTO attendees (name, email, ticket_type, event_id)
        VALUES (?, ?, ?, ?)
      `);
      const result = insert.run(name, email.toLowerCase(), ticket_type, eventId);

      const newAttendee = db.prepare(`
        SELECT a.*, e.name as event_name
        FROM attendees a
        JOIN events e ON a.event_id = e.id
        WHERE a.id = ?
      `).get(result.lastInsertRowid);

      return {
        status: 201,
        data: newAttendee,
        message: `Registered ${name} successfully for ${event.name}`
      };
    });

    const outcome = registerTx();

    if (outcome.error) {
      return res.status(outcome.status).json({
        success: false,
        error: outcome.error
      });
    }

    res.status(outcome.status).json({
      success: true,
      data: outcome.data,
      message: outcome.message
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
