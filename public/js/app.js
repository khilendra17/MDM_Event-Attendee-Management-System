/**
 * EventHorizon Application Core Controller
 * Orchestrates navigation, realtime state sync, validation, command palette, and UI FX
 */

class EventHorizonApp {
  static state = {
    events: [],
    attendees: [],
    stats: {},
    eventsQuery: '',
    attendeeFilters: {
      q: '',
      eventId: '',
      ticket: 'All'
    },
    deleteTarget: null
  };

  static init() {
    console.log('🌌 Initializing EventHorizon Holographic Engine...');

    // Set min date for create event form
    const evDateInput = document.getElementById('ev-date');
    if (evDateInput) {
      evDateInput.min = new Date().toISOString().split('T')[0];
    }

    // Attach all event handlers
    this.bindEvents();

    // Initial data fetch
    this.refreshAllData();

    // Setup card spotlights
    EventHorizonUI.setupCardSpotlights();
  }

  static async refreshAllData() {
    await Promise.all([
      this.loadStats(),
      this.loadEvents(),
      this.loadAttendees()
    ]);
  }

  static async loadStats() {
    try {
      const res = await EventHorizonAPI.getStats();
      if (res.success) {
        this.state.stats = res.data;
        const nextEvent = this.state.events.find(e => new Date(e.date) >= new Date());
        EventHorizonUI.updateDashboard(res.data, nextEvent ? nextEvent.date : null);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  }

  static async loadEvents(searchQuery = this.state.eventsQuery) {
    try {
      const res = await EventHorizonAPI.getEvents(searchQuery);
      if (res.success) {
        this.state.events = res.data;

        // Render Events Cards
        EventHorizonUI.renderEventsGrid(
          res.data,
          (id) => this.openRegisterForEvent(id),
          (id) => this.viewEventAttendees(id),
          (id, name) => this.promptDeleteEvent(id, name)
        );

        // Populate dropdowns
        this.populateDropdowns(res.data);

        // Update countdown with earliest upcoming event
        const nextEvent = res.data.find(e => new Date(e.date) >= new Date());
        EventHorizonUI.updateCountdownClock(nextEvent ? nextEvent.date : null);
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to fetch events', 'error');
    }
  }

  static async loadAttendees() {
    try {
      const res = await EventHorizonAPI.getAttendees(this.state.attendeeFilters);
      if (res.success) {
        this.state.attendees = res.data;
        EventHorizonUI.renderAttendeesBoardingPasses(
          res.data,
          (id, name) => this.promptDeleteAttendee(id, name)
        );
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to fetch attendees', 'error');
    }
  }

  static populateDropdowns(events) {
    const regSelect = document.getElementById('reg-event-id');
    const filterSelect = document.getElementById('attendees-event-dropdown-filter');

    const optionsHTML = '<option value="">-- Select Event --</option>' + 
      events.map(e => `
        <option value="${e.id}" ${e.seats_left <= 0 ? 'disabled' : ''}>
          ${EventHorizonUI.escapeHTML(e.name)} (${e.seats_left > 0 ? e.seats_left + ' seats left' : 'SOLD OUT'})
        </option>
      `).join('');

    if (regSelect) regSelect.innerHTML = optionsHTML;
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">All Events</option>' + 
        events.map(e => `<option value="${e.id}">${EventHorizonUI.escapeHTML(e.name)}</option>`).join('');
    }
  }

  static bindEvents() {
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const sectionId = e.currentTarget.dataset.section;
        if (sectionId) this.switchSection(sectionId);
      });
    });

    // Search Events with Debounce
    const evSearch = document.getElementById('events-search-bar');
    if (evSearch) {
      evSearch.addEventListener('input', this.debounce((e) => {
        this.state.eventsQuery = e.target.value.trim();
        this.loadEvents(this.state.eventsQuery);
      }, 300));
    }

    // Search Attendees with Debounce
    const attSearch = document.getElementById('attendees-search-bar');
    if (attSearch) {
      attSearch.addEventListener('input', this.debounce((e) => {
        this.state.attendeeFilters.q = e.target.value.trim();
        this.loadAttendees();
      }, 300));
    }

    // Ticket Filter Pills in Attendees Tab
    const pillContainer = document.getElementById('ticket-pill-filter');
    if (pillContainer) {
      pillContainer.querySelectorAll('.pill-btn').forEach(pill => {
        pill.addEventListener('click', (e) => {
          pillContainer.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          this.state.attendeeFilters.ticket = e.target.dataset.ticket;
          this.loadAttendees();
        });
      });
    }

    // Event Dropdown Filter for Attendees
    const eventFilterSelect = document.getElementById('attendees-event-dropdown-filter');
    if (eventFilterSelect) {
      eventFilterSelect.addEventListener('change', (e) => {
        this.state.attendeeFilters.eventId = e.target.value;
        this.loadAttendees();
      });
    }

    // Live Ticket Registration Preview Update
    const regName = document.getElementById('reg-name');
    const regEmail = document.getElementById('reg-email');
    const regEvent = document.getElementById('reg-event-id');

    const updatePreview = () => {
      const nameVal = regName ? regName.value : '';
      const emailVal = regEmail ? regEmail.value : '';
      const ticketVal = document.querySelector('input[name="ticket_type"]:checked')?.value || 'General';
      
      let eventName = 'Select an Event';
      if (regEvent && regEvent.value) {
        const selObj = this.state.events.find(e => e.id == regEvent.value);
        if (selObj) eventName = selObj.name;
      }

      EventHorizonUI.updateLiveTicketPreview(nameVal, emailVal, ticketVal, eventName);
    };

    if (regName) regName.addEventListener('input', updatePreview);
    if (regEmail) regEmail.addEventListener('input', updatePreview);
    if (regEvent) regEvent.addEventListener('change', updatePreview);

    document.querySelectorAll('input[name="ticket_type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.querySelectorAll('[data-ticket-radio]').forEach(btn => btn.classList.remove('active'));
        const btn = document.querySelector(`[data-ticket-radio="${e.target.value}"]`);
        if (btn) btn.classList.add('active');
        updatePreview();
      });
    });

    // Create Event Form Submit
    const formCreate = document.getElementById('form-create-event');
    if (formCreate) {
      formCreate.addEventListener('submit', (e) => this.handleCreateEventSubmit(e));
    }

    // Register Form Submit
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
      formRegister.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }

    // Execute Delete Confirm
    const btnExecuteDelete = document.getElementById('btn-execute-delete');
    if (btnExecuteDelete) {
      btnExecuteDelete.addEventListener('click', () => this.executeDeleteTarget());
    }

    // Command Palette Shortcuts (Ctrl+K or Cmd+K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleCmdK(true);
      }
      if (e.key === 'Escape') {
        this.toggleCmdK(false);
      }
    });

    const cmdKInput = document.getElementById('cmd-k-input');
    if (cmdKInput) {
      cmdKInput.addEventListener('input', this.debounce((e) => this.handleCmdKSearch(e.target.value.trim()), 200));
    }
  }

  // Section Navigation Switcher
  static switchSection(sectionId) {
    const sections = ['home-section', 'events-section', 'register-section', 'attendees-section'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Create Event Form Handler
  static async handleCreateEventSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('ev-name').value.trim();
    const date = document.getElementById('ev-date').value;
    const venue = document.getElementById('ev-venue').value.trim();
    const capacity = Number(document.getElementById('ev-capacity').value);

    // Past date check
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      EventHorizonUI.showToast('Event date cannot be in the past', 'error');
      return;
    }

    try {
      const res = await EventHorizonAPI.createEvent({ name, date, venue, capacity });
      if (res.success) {
        EventHorizonUI.showToast(`Event "${res.data.name}" created successfully!`, 'success');
        EventHorizonUI.closeModal('modal-create-event');
        document.getElementById('form-create-event').reset();

        await this.refreshAllData();
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to create event', 'error');
    }
  }

  // Register Form Handler
  static async handleRegisterSubmit(e) {
    e.preventDefault();
    const eventId = Number(document.getElementById('reg-event-id').value);
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const ticket_type = document.querySelector('input[name="ticket_type"]:checked')?.value || 'General';

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      EventHorizonUI.showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      const res = await EventHorizonAPI.registerAttendee(eventId, { name, email, ticket_type });
      if (res.success) {
        // Confetti Particle Explosion FX
        EventHorizonUI.triggerConfetti();

        EventHorizonUI.showToast(`Holographic Pass issued for ${res.data.name}!`, 'success');
        document.getElementById('form-register').reset();
        EventHorizonUI.updateLiveTicketPreview('', '', 'General', '');

        await this.refreshAllData();
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Registration failed', 'error');
    }
  }

  // Quick Action Openers
  static openCreateEventModal() {
    EventHorizonUI.openModal('modal-create-event');
  }

  static openRegisterForEvent(eventId) {
    this.switchSection('register-section');
    const select = document.getElementById('reg-event-id');
    if (select) {
      select.value = eventId;
      select.dispatchEvent(new Event('change'));
    }
  }

  static viewEventAttendees(eventId) {
    this.state.attendeeFilters.eventId = eventId;
    const select = document.getElementById('attendees-event-dropdown-filter');
    if (select) select.value = eventId;
    this.switchSection('attendees-section');
    this.loadAttendees();
  }

  // Delete Prompts
  static promptDeleteEvent(id, name) {
    this.state.deleteTarget = { type: 'event', id, name };
    document.getElementById('delete-confirm-header').innerText = 'Delete Event?';
    document.getElementById('delete-confirm-text').innerHTML = `
      Are you sure you want to delete <strong>"${EventHorizonUI.escapeHTML(name)}"</strong>?<br>
      <span style="color:#fb7185;">All attendees registered for this event will be permanently removed.</span>
    `;
    EventHorizonUI.openModal('modal-confirm-delete');
  }

  static promptDeleteAttendee(id, name) {
    this.state.deleteTarget = { type: 'attendee', id, name };
    document.getElementById('delete-confirm-header').innerText = 'Cancel Pass?';
    document.getElementById('delete-confirm-text').innerHTML = `
      Are you sure you want to cancel holographic pass for <strong>"${EventHorizonUI.escapeHTML(name)}"</strong>?
    `;
    EventHorizonUI.openModal('modal-confirm-delete');
  }

  static async executeDeleteTarget() {
    const target = this.state.deleteTarget;
    if (!target) return;

    try {
      if (target.type === 'event') {
        const res = await EventHorizonAPI.deleteEvent(target.id);
        if (res.success) EventHorizonUI.showToast(res.message, 'success');
      } else if (target.type === 'attendee') {
        const res = await EventHorizonAPI.deleteAttendee(target.id);
        if (res.success) EventHorizonUI.showToast(res.message, 'success');
      }

      EventHorizonUI.closeModal('modal-confirm-delete');
      await this.refreshAllData();
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Delete operation failed', 'error');
    } finally {
      this.state.deleteTarget = null;
    }
  }

  // Command Palette (Ctrl+K) Modal Handler
  static toggleCmdK(show) {
    const overlay = document.getElementById('cmd-k-overlay');
    const input = document.getElementById('cmd-k-input');
    if (!overlay) return;

    if (show) {
      overlay.classList.add('active');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.handleCmdKSearch('');
    } else {
      overlay.classList.remove('active');
    }
  }

  static handleCmdKSearch(query) {
    const resultsContainer = document.getElementById('cmd-k-results');
    if (!resultsContainer) return;

    const q = query.toLowerCase();
    const matchedEvents = this.state.events.filter(e => e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    const matchedAttendees = this.state.attendees.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));

    if (matchedEvents.length === 0 && matchedAttendees.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: #64748b;">
          No matching events or attendees found for "${EventHorizonUI.escapeHTML(query)}"
        </div>
      `;
      return;
    }

    let html = '';

    if (matchedEvents.length > 0) {
      html += `<div style="font-size:0.75rem; text-transform:uppercase; color:#64748b; padding:0.5rem 1rem;">Events</div>`;
      matchedEvents.slice(0, 4).forEach(e => {
        html += `
          <div class="cmd-k-item" onclick="EventHorizonApp.toggleCmdK(false); EventHorizonApp.openRegisterForEvent(${e.id});">
            <div>
              <strong style="color:#fff;">${EventHorizonUI.escapeHTML(e.name)}</strong>
              <div style="font-size:0.8rem; color:#94a3b8;">📅 ${EventHorizonUI.formatDate(e.date)} &bull; 📍 ${EventHorizonUI.escapeHTML(e.venue)}</div>
            </div>
            <span class="badge-holo badge-general-cyan">${e.seats_left} seats left</span>
          </div>
        `;
      });
    }

    if (matchedAttendees.length > 0) {
      html += `<div style="font-size:0.75rem; text-transform:uppercase; color:#64748b; padding:0.5rem 1rem; margin-top:0.5rem;">Attendees</div>`;
      matchedAttendees.slice(0, 4).forEach(a => {
        html += `
          <div class="cmd-k-item" onclick="EventHorizonApp.toggleCmdK(false); EventHorizonApp.viewEventAttendees(${a.event_id});">
            <div>
              <strong style="color:#fff;">${EventHorizonUI.escapeHTML(a.name)}</strong> (${EventHorizonUI.escapeHTML(a.email)})
              <div style="font-size:0.8rem; color:#94a3b8;">Event: ${EventHorizonUI.escapeHTML(a.event_name)}</div>
            </div>
            <span class="badge-holo badge-vip-foil">${a.ticket_type}</span>
          </div>
        `;
      });
    }

    resultsContainer.innerHTML = html;
  }

  // Debounce Helper
  static debounce(func, delay = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  EventHorizonApp.init();
});

window.EventHorizonApp = EventHorizonApp;
