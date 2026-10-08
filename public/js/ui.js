/**
 * EventHorizon UI Module
 * Handles DOM rendering, state updates, modal management, toasts, and animations
 */

class EventHorizonUI {

  // Toast System
  static showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✨';
    if (type === 'error') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${EventHorizonUI.escapeHTML(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  // Escape HTML to prevent XSS
  static escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Format Date String nicely
  static formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Section / View Switcher
  static switchSection(sectionId) {
    const sections = ['dashboard-section', 'events-section', 'attendees-section'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      if (btn.dataset.section === sectionId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Animated Count-Up Numbers
  static animateCount(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startValue = parseInt(el.innerText) || 0;
    const duration = 800; // ms
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease out
      const current = Math.floor(startValue + (targetValue - startValue) * easeProgress);
      
      el.innerText = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerText = targetValue.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  // Update Dashboard Stats
  static updateStats(stats) {
    this.animateCount('stat-total-events', stats.total_events);
    this.animateCount('stat-total-attendees', stats.total_attendees);
    this.animateCount('stat-seats-left', stats.total_seats_left);
    this.animateCount('stat-upcoming', stats.upcoming_events);
  }

  // Render Event Cards Grid
  static renderEventsGrid(events, onRegisterClick, onViewClick, onDeleteClick) {
    const container = document.getElementById('events-grid');
    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state glass-panel" style="grid-column: 1 / -1;">
          <div class="empty-icon">📅</div>
          <div class="empty-title">No events found</div>
          <p>Create your first event or adjust your search filter.</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="EventHorizonApp.openCreateEventModal()">+ Create Event</button>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(event => {
      const capacityPercent = Math.min(Math.round((event.registered_count / event.capacity) * 100), 100);
      const isFull = event.seats_left <= 0;
      
      let barClass = '';
      if (capacityPercent >= 100) barClass = 'full';
      else if (capacityPercent >= 80) barClass = 'warning';

      let seatBadge = isFull 
        ? `<span class="badge badge-full">FULL</span>` 
        : `<span class="badge badge-available">${event.seats_left} seats left</span>`;

      return `
        <div class="glass-panel glass-panel-hover event-card" data-event-id="${event.id}">
          <div class="event-header">
            <h3 class="event-name">${this.escapeHTML(event.name)}</h3>
            ${seatBadge}
          </div>

          <div class="event-meta">
            <div class="meta-item">
              <span>📅</span>
              <span>${this.formatDate(event.date)}</span>
            </div>
            <div class="meta-item">
              <span>📍</span>
              <span>${this.escapeHTML(event.venue)}</span>
            </div>
          </div>

          <div class="capacity-container">
            <div class="capacity-info">
              <span>Capacity</span>
              <span><strong>${event.registered_count}</strong> / ${event.capacity} (${capacityPercent}%)</span>
            </div>
            <div class="capacity-bar-bg">
              <div class="capacity-bar-fill ${barClass}" style="width: ${capacityPercent}%;"></div>
            </div>
          </div>

          <div class="event-footer">
            <button class="btn btn-primary btn-sm btn-register" 
              ${isFull ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} 
              data-id="${event.id}">
              ⚡ Register
            </button>
            <button class="btn btn-glass btn-sm btn-view-attendees" data-id="${event.id}">
              👁️ Attendees
            </button>
            <button class="btn btn-danger btn-sm btn-delete-event" data-id="${event.id}" data-name="${this.escapeHTML(event.name)}">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners to Card Buttons
    container.querySelectorAll('.btn-register').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        if (onRegisterClick) onRegisterClick(id);
      });
    });

    container.querySelectorAll('.btn-view-attendees').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        if (onViewClick) onViewClick(id);
      });
    });

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const name = e.currentTarget.dataset.name;
        if (onDeleteClick) onDeleteClick(id, name);
      });
    });
  }

  // Populate Event Dropdown Options
  static populateEventDropdown(events, selectElementId, selectedId = null) {
    const select = document.getElementById(selectElementId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Select an Event --</option>' + 
      events.map(e => `
        <option value="${e.id}" ${selectedId == e.id ? 'selected' : ''} ${e.seats_left <= 0 ? 'disabled' : ''}>
          ${this.escapeHTML(e.name)} (${e.seats_left > 0 ? e.seats_left + ' seats left' : 'FULL'})
        </option>
      `).join('');
  }

  // Render Attendees Table
  static renderAttendeesTable(attendees, onDeleteAttendeeClick) {
    const container = document.getElementById('attendees-table-body');
    const countBadge = document.getElementById('attendees-count-badge');
    if (!container) return;

    if (countBadge) {
      countBadge.innerText = `${attendees.length} Attendees`;
    }

    if (attendees.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-icon">👥</div>
            <div class="empty-title">No attendees registered yet</div>
            <p>Use the "Register Attendee" button to add someone to an event.</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = attendees.map(a => {
      let ticketBadge = 'badge-general';
      if (a.ticket_type === 'VIP') ticketBadge = 'badge-vip';
      if (a.ticket_type === 'Student') ticketBadge = 'badge-student';

      const initial = a.name.charAt(0).toUpperCase();

      return `
        <tr>
          <td>
            <div class="attendee-user">
              <div class="avatar">${initial}</div>
              <div>
                <strong style="color: #fff; font-size: 1rem;">${this.escapeHTML(a.name)}</strong>
              </div>
            </div>
          </td>
          <td>${this.escapeHTML(a.email)}</td>
          <td>
            <span class="badge ${ticketBadge}">${a.ticket_type}</span>
          </td>
          <td>
            <div style="font-weight: 500; color: #fff;">${this.escapeHTML(a.event_name)}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${this.formatDate(a.event_date)}</div>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-danger btn-sm btn-delete-attendee" data-id="${a.id}" data-name="${this.escapeHTML(a.name)}">
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    container.querySelectorAll('.btn-delete-attendee').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const name = e.currentTarget.dataset.name;
        if (onDeleteAttendeeClick) onDeleteAttendeeClick(id, name);
      });
    });
  }

  // Render Event Details Modal Contents
  static renderEventDetailsModal(event, onDeleteAttendeeClick) {
    const titleEl = document.getElementById('details-event-name');
    const metaEl = document.getElementById('details-event-meta');
    const bodyEl = document.getElementById('details-attendees-list');

    if (titleEl) titleEl.innerText = event.name;
    if (metaEl) {
      metaEl.innerHTML = `
        <span>📅 Date: ${this.formatDate(event.date)}</span> &bull; 
        <span>📍 Venue: ${this.escapeHTML(event.venue)}</span> &bull; 
        <span>🪑 Registered: ${event.registered_count} / ${event.capacity} (${event.seats_left} seats left)</span>
      `;
    }

    if (!bodyEl) return;

    if (!event.attendees || event.attendees.length === 0) {
      bodyEl.innerHTML = `
        <div class="empty-state">
          <p>No attendees have registered for this event yet.</p>
        </div>
      `;
      return;
    }

    bodyEl.innerHTML = `
      <table class="glass-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Ticket</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${event.attendees.map(a => `
            <tr>
              <td><strong>${this.escapeHTML(a.name)}</strong></td>
              <td>${this.escapeHTML(a.email)}</td>
              <td><span class="badge badge-${a.ticket_type.toLowerCase()}">${a.ticket_type}</span></td>
              <td>
                <button class="btn btn-danger btn-sm btn-delete-modal-attendee" data-id="${a.id}" data-name="${this.escapeHTML(a.name)}">
                  🗑️
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    bodyEl.querySelectorAll('.btn-delete-modal-attendee').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const name = e.currentTarget.dataset.name;
        if (onDeleteAttendeeClick) onDeleteAttendeeClick(id, name);
      });
    });
  }

  // Modal Show / Hide Utils
  static openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

window.EventHorizonUI = EventHorizonUI;
