function validateEvent(req, res, next) {
  const { name, date, venue, capacity } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Event name is required' });
  }

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid event date is required' });
  }

  // Date format check YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date) || isNaN(Date.parse(date))) {
    return res.status(400).json({ success: false, error: 'Event date must be a valid date in YYYY-MM-DD format' });
  }

  // Prevent past dates (compare date with today's start of day UTC/local)
  const todayStr = new Date().toISOString().split('T')[0];
  if (date < todayStr) {
    return res.status(400).json({ success: false, error: 'Event date cannot be in the past' });
  }

  if (!venue || typeof venue !== 'string' || venue.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Venue is required' });
  }

  const parsedCapacity = Number(capacity);
  if (isNaN(parsedCapacity) || !Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
    return res.status(400).json({ success: false, error: 'Capacity must be a positive integer greater than zero' });
  }

  req.body.name = name.trim();
  req.body.date = date;
  req.body.venue = venue.trim();
  req.body.capacity = parsedCapacity;

  next();
}

function validateAttendee(req, res, next) {
  const { name, email, ticket_type } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Attendee name is required' });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Email address is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }

  const validTickets = ['General', 'VIP', 'Student'];
  if (!ticket_type || !validTickets.includes(ticket_type)) {
    return res.status(400).json({ success: false, error: 'Ticket type must be General, VIP, or Student' });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.ticket_type = ticket_type;

  next();
}

module.exports = {
  validateEvent,
  validateAttendee
};
