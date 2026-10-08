/**
 * EventHorizon API Client Module
 * Provides clean AJAX/Fetch wrappers for all REST endpoints
 */

const API_BASE = '/api';

class EventHorizonAPI {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  // Dashboard Stats
  static async getStats() {
    return this.request('/stats');
  }

  // Events API
  static async getEvents(searchQuery = '') {
    const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    return this.request(`/events${query}`);
  }

  static async getEventById(id) {
    return this.request(`/events/${id}`);
  }

  static async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  static async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Attendees API
  static async registerAttendee(eventId, attendeeData) {
    return this.request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(attendeeData)
    });
  }

  static async getAttendees(filters = {}) {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.eventId) params.append('event_id', filters.eventId);
    if (filters.ticket && filters.ticket !== 'All') params.append('ticket', filters.ticket);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/attendees${queryString}`);
  }

  static async deleteAttendee(id) {
    return this.request(`/attendees/${id}`, {
      method: 'DELETE'
    });
  }
}

// Attach to window object for global usage
window.EventHorizonAPI = EventHorizonAPI;
