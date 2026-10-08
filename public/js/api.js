/**
 * EventHorizon API Wrapper
 * Handles server endpoints with transparent mock fallback support
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
        throw new Error(data.error || `Server Error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`API fetch failed [${options.method || 'GET'} ${endpoint}]:`, err.message);
      
      // If server error, throw to let caller show toast
      if (err.message.includes('Server Error') || err.message.includes('409') || err.message.includes('400') || err.message.includes('404')) {
        throw err;
      }

      // Network disconnect or offline -> fallback to mock mode
      if (window.EventHorizonMock) {
        window.EventHorizonMock.enableDemoMode();
        return this.handleMockFallback(endpoint, options);
      }

      throw err;
    }
  }

  static handleMockFallback(endpoint, options) {
    const mock = window.EventHorizonMock;
    const method = options.method || 'GET';

    if (endpoint === '/stats') {
      return { success: true, data: mock.stats };
    }

    if (endpoint.startsWith('/events')) {
      if (method === 'GET') {
        if (endpoint.includes('?q=')) {
          const q = new URLSearchParams(endpoint.split('?')[1]).get('q') || '';
          const filtered = mock.events.filter(e => 
            e.name.toLowerCase().includes(q.toLowerCase()) || 
            e.venue.toLowerCase().includes(q.toLowerCase())
          );
          return { success: true, data: filtered };
        }
        return { success: true, data: mock.events };
      }

      if (method === 'POST') {
        const body = JSON.parse(options.body);
        const newEvent = {
          id: Date.now(),
          ...body,
          registered_count: 0,
          seats_left: body.capacity
        };
        mock.events.unshift(newEvent);
        mock.stats.total_events++;
        mock.stats.total_seats_left += body.capacity;
        return { success: true, data: newEvent, message: 'Event created (Demo Mode)' };
      }
    }

    if (endpoint.startsWith('/attendees')) {
      if (method === 'GET') {
        return { success: true, data: mock.attendees };
      }
    }

    return { success: true, data: [], message: 'Demo mode fallback' };
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

window.EventHorizonAPI = EventHorizonAPI;
