const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/stats - Dashboard analytics summary
router.get('/', (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const totalAttendees = db.prepare('SELECT COUNT(*) as count FROM attendees').get().count;

    const capacityResult = db.prepare(`
      SELECT 
        COALESCE(SUM(capacity), 0) as total_capacity,
        COALESCE(SUM(capacity), 0) - (SELECT COUNT(*) FROM attendees) as total_seats_left
      FROM events
    `).get();

    const upcomingEvents = db.prepare(`
      SELECT COUNT(*) as count FROM events WHERE date >= ?
    `).get(todayStr).count;

    res.status(200).json({
      success: true,
      data: {
        total_events: totalEvents,
        total_attendees: totalAttendees,
        total_capacity: capacityResult.total_capacity,
        total_seats_left: capacityResult.total_seats_left < 0 ? 0 : capacityResult.total_seats_left,
        upcoming_events: upcomingEvents
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
