/**
 * EventHorizon Holographic UI Renderer & FX Engine
 * Implements 3D tilt, tracking spotlight glows, confetti bursts, live ticket previews, and Command Palette
 */

class EventHorizonUI {

  // Toast System
  static showToast(message, type = 'success') {
    const shelf = document.getElementById('toast-shelf');
    if (!shelf) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = '✨';
    if (type === 'error') icon = '⚠️';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
      <div style="font-size: 1.4rem;">${icon}</div>
      <div style="font-size: 0.9rem; font-weight: 500; color: #fff;">${this.escapeHTML(message)}</div>
    `;

    shelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 350);
    }, 4200);
  }

  // HTML Sanitization
  static escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Date Formatting
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

  // Vanilla Canvas Confetti Burst Engine
  static triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#8b5cf6', '#22d3ee', '#f472b6', '#f59e0b', '#10b981', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 100,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 22,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        if (p.alpha > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.45; // gravity
          p.rotation += p.rSpeed;
          p.alpha -= 0.015;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    render();
  }

  // Tracking Spotlight & 3D Tilt Effect Setup
  static setupCardSpotlights() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // 3D Tilt calculation
        if (card.classList.contains('tilt-card')) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        if (card.classList.contains('tilt-card')) {
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        }
      });
    });
  }

  // Count-Up Stat Numbers
  static animateCount(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startValue = parseInt(el.innerText) || 0;
    const duration = 900;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
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

  // Update Bento Dashboard & Donut Chart
  static updateDashboard(stats, nextEventDateStr = null) {
    this.animateCount('bento-events-count', stats.total_events || 0);
    this.animateCount('bento-attendees-count', stats.total_attendees || 0);
    this.animateCount('bento-seats-count', stats.total_seats_left || 0);

    // Update Animated Donut Segment
    const donutSegment = document.getElementById('donut-segment');
    const donutRatioText = document.getElementById('donut-ratio-text');
    if (donutSegment && stats.total_capacity > 0) {
      const occupied = stats.total_attendees || 0;
      const capacity = stats.total_capacity;
      const fillPercentage = Math.min(occupied / capacity, 1);
      const totalDash = 283;
      const offset = totalDash - (totalDash * fillPercentage);
      donutSegment.style.strokeDashoffset = offset;

      if (donutRatioText) {
        donutRatioText.innerText = `${Math.round(fillPercentage * 100)}%`;
      }
    }

    // Update Next Event Countdown Clock
    this.updateCountdownClock(nextEventDateStr);
  }

  // Live Countdown Clock
  static updateCountdownClock(targetDateStr) {
    const clockContainer = document.getElementById('countdown-container');
    if (!clockContainer) return;

    if (!targetDateStr) {
      clockContainer.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">No upcoming events scheduled</p>`;
      return;
    }

    const targetDate = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0) {
      clockContainer.innerHTML = `<p style="color: var(--cyan-primary); font-size: 0.9rem;">Event is taking place today!</p>`;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    clockContainer.innerHTML = `
      <div class="countdown-box">
        <div class="countdown-unit">
          <div class="countdown-num">${days}</div>
          <div class="countdown-lbl">Days</div>
        </div>
        <div class="countdown-unit">
          <div class="countdown-num">${hours}</div>
          <div class="countdown-lbl">Hours</div>
        </div>
        <div class="countdown-unit">
          <div class="countdown-num">${mins}</div>
          <div class="countdown-lbl">Mins</div>
        </div>
      </div>
    `;
  }

  // Render Event Cards Grid
  static renderEventsGrid(events, onRegisterClick, onViewClick, onDeleteClick) {
    const container = document.getElementById('events-cards-grid');
    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = `
        <div class="spotlight-card" style="grid-column: 1 / -1; padding: 4rem; text-align: center;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">📅</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No Events Found</h3>
          <p style="color: #94a3b8; margin-bottom: 1.5rem;">Create a new event or refine your search query.</p>
          <button class="btn-shimmer btn-holo" onclick="EventHorizonApp.openCreateEventModal()">+ Create Event</button>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(e => {
      const capacityPercent = Math.min(Math.round((e.registered_count / e.capacity) * 100), 100);
      const isSoldOut = e.seats_left <= 0;
      const isAlmostFull = !isSoldOut && e.seats_left <= Math.max(3, Math.ceil(e.capacity * 0.2));

      let badge = `<span class="badge-holo badge-general-cyan">${e.seats_left} seats left</span>`;
      let fillClass = '';

      if (isSoldOut) {
        badge = `<span class="badge-holo badge-sold-out">SOLD OUT</span>`;
        fillClass = 'sold-out';
      } else if (isAlmostFull) {
        badge = `<span class="badge-holo badge-almost-full">ALMOST FULL</span>`;
        fillClass = 'almost-full';
      }

      return `
        <div class="spotlight-card tilt-card event-hologram-card" data-event-id="${e.id}">
          <div class="event-card-header">
            <h3 class="event-card-title">${this.escapeHTML(e.name)}</h3>
            ${badge}
          </div>

          <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
              <span>📅</span> <span>${this.formatDate(e.date)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span>📍</span> <span>${this.escapeHTML(e.venue)}</span>
            </div>
          </div>

          <div class="capacity-progress-wrapper">
            <div class="capacity-labels">
              <span>Capacity</span>
              <span><strong>${e.registered_count}</strong> / ${e.capacity} (${capacityPercent}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${fillClass}" style="width: ${capacityPercent}%;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <button class="btn-shimmer btn-holo btn-sm btn-register-card" 
              ${isSoldOut ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} 
              data-id="${e.id}">
              ⚡ Register
            </button>
            <button class="btn-shimmer btn-glass-subtle btn-sm btn-view-card" data-id="${e.id}">
              👁️ Attendees
            </button>
            <button class="btn-shimmer btn-danger-glass btn-sm btn-delete-card" data-id="${e.id}" data-name="${this.escapeHTML(e.name)}">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Handlers & Re-init Spotlight Tracking
    container.querySelectorAll('.btn-register-card').forEach(btn => {
      btn.addEventListener('click', (ev) => onRegisterClick(Number(ev.currentTarget.dataset.id)));
    });

    container.querySelectorAll('.btn-view-card').forEach(btn => {
      btn.addEventListener('click', (ev) => onViewClick(Number(ev.currentTarget.dataset.id)));
    });

    container.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (ev) => onDeleteClick(Number(ev.currentTarget.dataset.id), ev.currentTarget.dataset.name));
    });

    this.setupCardSpotlights();
  }

  // Render Holographic Boarding Pass Attendees View
  static renderAttendeesBoardingPasses(attendees, onDeleteClick) {
    const container = document.getElementById('attendees-display-container');
    const badge = document.getElementById('attendees-count-tag');
    if (!container) return;

    if (badge) badge.innerText = `${attendees.length} Attendees`;

    if (attendees.length === 0) {
      container.innerHTML = `
        <div class="spotlight-card" style="grid-column: 1 / -1; padding: 4rem; text-align: center;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎫</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No Attendees Registered</h3>
          <p style="color: #94a3b8; margin-bottom: 1.5rem;">Use the registration form to issue holographic passes.</p>
          <button class="btn-shimmer btn-pink" onclick="EventHorizonApp.switchSection('register-section')">⚡ Register Attendee</button>
        </div>
      `;
      return;
    }

    container.className = 'tickets-grid';
    container.innerHTML = attendees.map(a => {
      let badgeClass = 'badge-general-cyan';
      if (a.ticket_type === 'VIP') badgeClass = 'badge-vip-foil';
      if (a.ticket_type === 'Student') badgeClass = 'badge-student-lime';

      return `
        <div class="spotlight-card tilt-card boarding-pass-card">
          <div class="pass-header">
            <div>
              <span class="badge-holo ${badgeClass}">${a.ticket_type} PASS</span>
            </div>
            <div style="font-size: 0.8rem; color: #64748b; font-family: var(--font-heading);">
              #EH-${a.id}
            </div>
          </div>

          <div class="pass-body">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${this.escapeHTML(a.name)}</h3>
            <p style="color: var(--cyan-primary); font-size: 0.88rem; margin-bottom: 1rem;">${this.escapeHTML(a.email)}</p>

            <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
              <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">Event</div>
              <strong style="color: #fff;">${this.escapeHTML(a.event_name)}</strong>
              <div style="color: #64748b; font-size: 0.8rem; margin-top: 0.25rem;">📅 ${this.formatDate(a.event_date)}</div>
            </div>
          </div>

          <div class="pass-footer">
            <!-- CSS Barcode -->
            <div class="barcode">
              <div class="barcode-bar w-2"></div>
              <div class="barcode-bar w-1"></div>
              <div class="barcode-bar w-3"></div>
              <div class="barcode-bar w-1"></div>
              <div class="barcode-bar w-2"></div>
              <div class="barcode-bar w-3"></div>
              <div class="barcode-bar w-1"></div>
              <div class="barcode-bar w-2"></div>
            </div>

            <button class="btn-shimmer btn-danger-glass btn-sm btn-delete-pass" data-id="${a.id}" data-name="${this.escapeHTML(a.name)}">
              🗑️ Cancel Pass
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-delete-pass').forEach(btn => {
      btn.addEventListener('click', (ev) => onDeleteClick(Number(ev.currentTarget.dataset.id), ev.currentTarget.dataset.name));
    });

    this.setupCardSpotlights();
  }

  // Update Live Registration Holographic Ticket Preview
  static updateLiveTicketPreview(name, email, ticketType, eventName) {
    const previewName = document.getElementById('preview-ticket-name');
    const previewEmail = document.getElementById('preview-ticket-email');
    const previewBadge = document.getElementById('preview-ticket-badge');
    const previewEvent = document.getElementById('preview-ticket-event');

    if (previewName) previewName.innerText = name.trim() || 'PASS HOLDER NAME';
    if (previewEmail) previewEmail.innerText = email.trim() || 'attendee@horizon.io';
    if (previewEvent) previewEvent.innerText = eventName || 'Select an Event';

    if (previewBadge) {
      previewBadge.className = 'badge-holo';
      if (ticketType === 'VIP') {
        previewBadge.classList.add('badge-vip-foil');
        previewBadge.innerText = 'VIP PASS';
      } else if (ticketType === 'Student') {
        previewBadge.classList.add('badge-student-lime');
        previewBadge.innerText = 'STUDENT PASS';
      } else {
        previewBadge.classList.add('badge-general-cyan');
        previewBadge.innerText = 'GENERAL PASS';
      }
    }
  }

  // Modals & Overlays
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
