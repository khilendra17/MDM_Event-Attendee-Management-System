/**
 * EventHorizon Core Application Controller
 * Orchestrates API calls, UI re-renders, state synchronization, and event handlers
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
    activeEventForDetails: null,
    deleteTarget: null // { type: 'event'|'attendee', id: number, name: string }
  };

  static init() {
    console.log('🌌 Initializing EventHorizon Application...');

    // Set minimum date for event creation form to today
    const dateInput = document.getElementById('event-date');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Attach Event Listeners
    this.bindEvents();

    // Initial Data Fetch
    this.refreshAllData();
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
        EventHorizonUI.updateStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  static async loadEvents(searchQuery = this.state.eventsQuery) {
    try {
      const res = await EventHorizonAPI.getEvents(searchQuery);
      if (res.success) {
        this.state.events = res.data;
        EventHorizonUI.renderEventsGrid(
          res.data,
          (id) => this.openRegisterModal(id),
          (id) => this.openEventDetailsModal(id),
          (id, name) => this.promptDeleteEvent(id, name)
        );

        // Populate dropdowns
        EventHorizonUI.populateEventDropdown(res.data, 'register-event-id');
        EventHorizonUI.populateEventDropdown(res.data, 'attendees-event-filter', this.state.attendeeFilters.eventId);
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to load events', 'error');
    }
  }

  static async loadAttendees() {
    try {
      const res = await EventHorizonAPI.getAttendees(this.state.attendeeFilters);
      if (res.success) {
        this.state.attendees = res.data;
        EventHorizonUI.renderAttendeesTable(
          res.data,
          (id, name) => this.promptDeleteAttendee(id, name)
        );
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to load attendees', 'error');
    }
  }

  static bindEvents() {
    // Search Events with Debounce
    const eventsSearchInput = document.getElementById('events-search-input');
    if (eventsSearchInput) {
      eventsSearchInput.addEventListener('input', this.debounce((e) => {
        this.state.eventsQuery = e.target.value.trim();
        this.loadEvents(this.state.eventsQuery);
      }, 300));
    }

    // Search Attendees with Debounce
    const attendeesSearchInput = document.getElementById('attendees-search-input');
    if (attendeesSearchInput) {
      attendeesSearchInput.addEventListener('input', this.debounce((e) => {
        this.state.attendeeFilters.q = e.target.value.trim();
        this.loadAttendees();
      }, 300));
    }

    // Ticket Type Filter Pills
    const pillContainer = document.getElementById('ticket-filter-pills');
    if (pillContainer) {
      pillContainer.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
          pillContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          e.target.classList.add('active');
          this.state.attendeeFilters.ticket = e.target.dataset.ticket;
          this.loadAttendees();
        });
      });
    }

    // Event Dropdown Filter for Attendees
    const eventFilterSelect = document.getElementById('attendees-event-filter');
    if (eventFilterSelect) {
      eventFilterSelect.addEventListener('change', (e) => {
        this.state.attendeeFilters.eventId = e.target.value;
        this.loadAttendees();
      });
    }

    // Create Event Form Submit
    const createEventForm = document.getElementById('form-create-event');
    if (createEventForm) {
      createEventForm.addEventListener('submit', (e) => this.handleCreateEvent(e));
    }

    // Register Attendee Form Submit
    const registerAttendeeForm = document.getElementById('form-register-attendee');
    if (registerAttendeeForm) {
      registerAttendeeForm.addEventListener('submit', (e) => this.handleRegisterAttendee(e));
    }

    // Confirm Delete Action Button
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete-action');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.executeDeleteTarget());
    }

    // Quick Register Button inside Details Modal
    const quickRegisterModalBtn = document.getElementById('btn-quick-register-modal');
    if (quickRegisterModalBtn) {
      quickRegisterModalBtn.addEventListener('click', () => {
        const eventId = this.state.activeEventForDetails?.id;
        EventHorizonUI.closeModal('modal-event-details');
        this.openRegisterModal(eventId);
      });
    }
  }

  // Create Event Handler
  static async handleCreateEvent(e) {
    e.preventDefault();
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    const venue = document.getElementById('event-venue').value;
    const capacity = Number(document.getElementById('event-capacity').value);

    try {
      const res = await EventHorizonAPI.createEvent({ name, date, venue, capacity });
      if (res.success) {
        EventHorizonUI.showToast(`Event "${res.data.name}" created successfully!`, 'success');
        EventHorizonUI.closeModal('modal-create-event');
        document.getElementById('form-create-event').reset();

        // Refresh state without reload
        await this.refreshAllData();
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to create event', 'error');
    }
  }

  // Register Attendee Handler
  static async handleRegisterAttendee(e) {
    e.preventDefault();
    const eventId = Number(document.getElementById('register-event-id').value);
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const ticket_type = document.querySelector('input[name="ticket_type"]:checked')?.value || 'General';

    if (!eventId) {
      EventHorizonUI.showToast('Please select an event', 'error');
      return;
    }

    try {
      const res = await EventHorizonAPI.registerAttendee(eventId, { name, email, ticket_type });
      if (res.success) {
        EventHorizonUI.showToast(`Registered ${res.data.name} successfully!`, 'success');
        EventHorizonUI.closeModal('modal-register-attendee');
        document.getElementById('form-register-attendee').reset();

        // Refresh state dynamically
        await this.refreshAllData();
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Registration failed', 'error');
    }
  }

  // Modal Openers
  static openCreateEventModal() {
    EventHorizonUI.openModal('modal-create-event');
  }

  static openRegisterModal(selectedEventId = null) {
    EventHorizonUI.populateEventDropdown(this.state.events, 'register-event-id', selectedEventId);
    EventHorizonUI.openModal('modal-register-attendee');
  }

  static async openEventDetailsModal(eventId) {
    try {
      const res = await EventHorizonAPI.getEventById(eventId);
      if (res.success) {
        this.state.activeEventForDetails = res.data;
        EventHorizonUI.renderEventDetailsModal(res.data, (attId, attName) => this.promptDeleteAttendee(attId, attName));
        EventHorizonUI.openModal('modal-event-details');
      }
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Failed to fetch event details', 'error');
    }
  }

  // Delete Prompting & Execution
  static promptDeleteEvent(id, name) {
    this.state.deleteTarget = { type: 'event', id, name };
    document.getElementById('delete-confirm-title').innerText = 'Delete Event?';
    document.getElementById('delete-confirm-message').innerHTML = `
      Are you sure you want to delete <strong>"${EventHorizonUI.escapeHTML(name)}"</strong>?<br>
      <span style="color: var(--color-danger); font-size: 0.85rem;">This will cascade and remove all registered attendees for this event.</span>
    `;
    EventHorizonUI.openModal('modal-confirm-delete');
  }

  static promptDeleteAttendee(id, name) {
    this.state.deleteTarget = { type: 'attendee', id, name };
    document.getElementById('delete-confirm-title').innerText = 'Remove Attendee?';
    document.getElementById('delete-confirm-message').innerHTML = `
      Are you sure you want to remove <strong>"${EventHorizonUI.escapeHTML(name)}"</strong> from this event?
    `;
    EventHorizonUI.openModal('modal-confirm-delete');
  }

  static async executeDeleteTarget() {
    const target = this.state.deleteTarget;
    if (!target) return;

    try {
      if (target.type === 'event') {
        const res = await EventHorizonAPI.deleteEvent(target.id);
        if (res.success) {
          EventHorizonUI.showToast(res.message, 'success');
        }
      } else if (target.type === 'attendee') {
        const res = await EventHorizonAPI.deleteAttendee(target.id);
        if (res.success) {
          EventHorizonUI.showToast(res.message, 'success');
        }
      }

      EventHorizonUI.closeModal('modal-confirm-delete');
      EventHorizonUI.closeModal('modal-event-details');

      // Refresh data
      await this.refreshAllData();
    } catch (err) {
      EventHorizonUI.showToast(err.message || 'Delete operation failed', 'error');
    } finally {
      this.state.deleteTarget = null;
    }
  }

  // View Switcher Proxy
  static switchSection(sectionId) {
    EventHorizonUI.switchSection(sectionId);
  }

  // Utility: Debounce function for smooth search
  static debounce(func, delay = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  EventHorizonApp.init();
});

window.EventHorizonApp = EventHorizonApp;
