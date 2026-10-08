process.env.NODE_ENV = 'test';
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');
const db = require('../db/database');

describe('EventHorizon API Specification Test Suite (PRD Test Plan T1 - T10)', () => {

  let createdEventId;
  let createdAttendeeId;

  // T1: Create event with all valid fields
  test('T1: Create event with all valid fields (201)', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        name: 'Quantum Computing Seminar 2026',
        date: '2026-11-20',
        venue: 'Main Science Hall, Campus West',
        capacity: 2
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Quantum Computing Seminar 2026');
    assert.equal(res.body.data.capacity, 2);
    assert.equal(res.body.data.registered_count, 0);
    assert.equal(res.body.data.seats_left, 2);
    createdEventId = res.body.data.id;
  });

  // T2: Create event with missing field
  test('T2: Create event with missing required field (400)', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        name: '', // Empty name
        date: '2026-11-20',
        venue: 'Main Science Hall',
        capacity: 50
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Event name is required/i);
  });

  // T3: Register valid attendee
  test('T3: Register valid attendee for an event (201)', async () => {
    const res = await request(app)
      .post(`/api/events/${createdEventId}/register`)
      .send({
        name: 'Alice Turing',
        email: 'alice@turing.org',
        ticket_type: 'VIP'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Alice Turing');
    assert.equal(res.body.data.email, 'alice@turing.org');
    assert.equal(res.body.data.ticket_type, 'VIP');
    createdAttendeeId = res.body.data.id;

    // Verify seat count decreased
    const eventRes = await request(app).get(`/api/events/${createdEventId}`);
    assert.equal(eventRes.body.data.registered_count, 1);
    assert.equal(eventRes.body.data.seats_left, 1);
  });

  // T4: Register with invalid email
  test('T4: Register with invalid email format (400)', async () => {
    const res = await request(app)
      .post(`/api/events/${createdEventId}/register`)
      .send({
        name: 'Bob Smith',
        email: 'invalid-email-format',
        ticket_type: 'General'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /valid email address/i);
  });

  // T5: Register same email twice for same event
  test('T5: Register same email twice for same event (409 Duplicate)', async () => {
    const res = await request(app)
      .post(`/api/events/${createdEventId}/register`)
      .send({
        name: 'Alice Duplicate',
        email: 'alice@turing.org', // Duplicate email
        ticket_type: 'Student'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /already registered/i);
  });

  // T6: Register to non-existent event ID
  test('T6: Register to non-existent event ID (404)', async () => {
    const res = await request(app)
      .post('/api/events/99999/register')
      .send({
        name: 'Ghost User',
        email: 'ghost@nowhere.com',
        ticket_type: 'General'
      });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Event not found/i);
  });

  // T7: Register to a full event
  test('T7: Register to a full event (409 Event is full)', async () => {
    // Fill the remaining 1 seat (capacity is 2, 1 registered so far)
    await request(app)
      .post(`/api/events/${createdEventId}/register`)
      .send({
        name: 'Second Attendee',
        email: 'second@event.org',
        ticket_type: 'General'
      });

    // Try registering 3rd attendee
    const res = await request(app)
      .post(`/api/events/${createdEventId}/register`)
      .send({
        name: 'Over capacity Attendee',
        email: 'overcapacity@event.org',
        ticket_type: 'Student'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Event is full/i);
  });

  // T8: Search attendees by partial name/email
  test('T8: Search attendees by partial name (200)', async () => {
    const res = await request(app)
      .get('/api/attendees')
      .query({ q: 'Alice' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
    assert.equal(res.body.data[0].name, 'Alice Turing');
  });

  // T9: Delete attendee
  test('T9: Delete attendee frees up seat (200)', async () => {
    const delRes = await request(app)
      .delete(`/api/attendees/${createdAttendeeId}`);

    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.success, true);

    // Verify seat freed up
    const eventRes = await request(app).get(`/api/events/${createdEventId}`);
    assert.equal(eventRes.body.data.registered_count, 1);
    assert.equal(eventRes.body.data.seats_left, 1);
  });

  // T10: Delete event (cascade delete attendees)
  test('T10: Delete event cascades to attendees (200)', async () => {
    const delRes = await request(app)
      .delete(`/api/events/${createdEventId}`);

    assert.equal(delRes.status, 200);

    // Verify event is gone
    const getRes = await request(app).get(`/api/events/${createdEventId}`);
    assert.equal(getRes.status, 404);

    // Verify attendees for this event are cascade deleted
    const attRes = await request(app)
      .get('/api/attendees')
      .query({ event_id: createdEventId });
    assert.equal(attRes.body.data.length, 0);
  });

});
