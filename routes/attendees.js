const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/attendees - Search / filter list of attendees
router.get('/', (req, res, next) => {
  try {
    const q = req.query.q ? `%${req.query.q.trim()}%` : '%';
    const eventId = req.query.event_id ? Number(req.query.event_id) : null;
    const ticket = req.query.ticket && req.query.ticket !== 'All' ? req.query.ticket : null;

    let query = `
      SELECT 
        a.id, 
        a.name, 
        a.email, 
        a.ticket_type, 
        a.event_id, 
        a.created_at,
        e.name AS event_name,
        e.date AS event_date,
        e.venue AS event_venue
      FROM attendees a
      JOIN events e ON a.event_id = e.id
      WHERE (a.name LIKE ? OR a.email LIKE ? OR e.name LIKE ?)
    `;

    const params = [q, q, q];

    if (eventId) {
      query += ` AND a.event_id = ?`;
      params.push(eventId);
    }

    if (ticket) {
      query += ` AND a.ticket_type = ?`;
      params.push(ticket);
    }

    query += ` ORDER BY a.created_at DESC`;

    const stmt = db.prepare(query);
    const attendees = stmt.all(...params);

    res.status(200).json({
      success: true,
      data: attendees
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/attendees/:id - Remove attendee
router.delete('/:id', (req, res, next) => {
  try {
    const attendeeId = Number(req.params.id);

    const attendee = db.prepare('SELECT id, name, event_id FROM attendees WHERE id = ?').get(attendeeId);
    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Attendee record not found'
      });
    }

    db.prepare('DELETE FROM attendees WHERE id = ?').run(attendeeId);

    res.status(200).json({
      success: true,
      message: `Attendee "${attendee.name}" removed successfully`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
