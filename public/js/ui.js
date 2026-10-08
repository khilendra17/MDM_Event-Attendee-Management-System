/**
 * EventHorizon Navy & Gold UI Renderer & FX Engine
 * Professional, organized, emoji-free SVG vector iconography
 */

class EventHorizonUI {

  // SVG Icons Helpers
  static getSVGIcon(name) {
    const icons = {
      calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      venue: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      ticket: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><path d="M13 5v14"/></svg>`,
      search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
      check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      crown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`
    };
    return icons[name] || '';
  }

  // Toast System (Emoji-Free)
  static showToast(message, type = 'success') {
    const shelf = document.getElementById('toast-shelf');
    if (!shelf) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSVG = this.getSVGIcon('check');
    if (type === 'error') iconSVG = this.getSVGIcon('alert');

    toast.innerHTML = `
      <div>${iconSVG}</div>
      <div style="font-size: 0.9rem; font-weight: 600; color: #fff;">${this.escapeHTML(message)}</div>
    `;

    shelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 350);
    }, 4200);
  }

  // Sanitization & Date Formatting
  static escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

  // Sovereign Gold Canvas Confetti Burst
  static triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#38bdf8', '#ffffff'];

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
          p.vy += 0.45;
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

  // Setup Tracking Card Spotlight & 3D Tilt
  static setupCardSpotlights() {
    document.querySelectorAll('.navy-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (card.classList.contains('tilt-card')) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -6;
          const rotateY = ((x - centerX) / centerX) * 6;
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

  // Animated Numbers
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

  // Update Dashboard Bento Stats & Donut Chart
  static updateDashboard(stats, nextEventDateStr = null) {
    this.animateCount('bento-events-count', stats.total_events || 0);
    this.animateCount('bento-attendees-count', stats.total_attendees || 0);
    this.animateCount('bento-seats-count', stats.total_seats_left || 0);

    const donutProgress = document.getElementById('donut-progress');
    const donutText = document.getElementById('donut-ratio-text');
    if (donutProgress && stats.total_capacity > 0) {
      const occupied = stats.total_attendees || 0;
      const capacity = stats.total_capacity;
      const fillPercentage = Math.min(occupied / capacity, 1);
      const totalDash = 283;
      const offset = totalDash - (totalDash * fillPercentage);
      donutProgress.style.strokeDashoffset = offset;

      if (donutText) {
        donutText.innerText = `${Math.round(fillPercentage * 100)}%`;
      }
    }

    this.updateCountdownClock(nextEventDateStr);
  }

  // Live Countdown Clock
  static updateCountdownClock(targetDateStr) {
    const clockContainer = document.getElementById('countdown-container');
    if (!clockContainer) return;

    if (!targetDateStr) {
      clockContainer.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">No upcoming executive events scheduled</p>`;
      return;
    }

    const targetDate = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0) {
      clockContainer.innerHTML = `<p style="color: var(--gold-bright); font-size: 0.9rem;">Event is currently taking place</p>`;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    clockContainer.innerHTML = `
      <div class="clock-row">
        <div class="clock-item">
          <div class="clock-val">${days}</div>
          <div class="clock-lbl">Days</div>
        </div>
        <div class="clock-item">
          <div class="clock-val">${hours}</div>
          <div class="clock-lbl">Hours</div>
        </div>
        <div class="clock-item">
          <div class="clock-val">${mins}</div>
          <div class="clock-lbl">Mins</div>
        </div>
      </div>
    `;
  }

  // Render Event Cards Grid (Emoji Free)
  static renderEventsGrid(events, onRegisterClick, onViewClick, onDeleteClick) {
    const container = document.getElementById('events-cards-grid');
    if (!container) return;

    if (events.length === 0) {
      container.innerHTML = `
        <div class="navy-card" style="grid-column: 1 / -1; padding: 4rem; text-align: center;">
          <div style="color: var(--gold-bright); margin-bottom: 1rem;">${this.getSVGIcon('calendar')}</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No Events Registered</h3>
          <p style="color: #94a3b8; margin-bottom: 1.5rem;">Add a new event or refine your search query.</p>
          <button class="btn-gold" onclick="EventHorizonApp.openCreateEventModal()">${this.getSVGIcon('plus')} Create Event</button>
        </div>
      `;
      return;
    }

    container.innerHTML = events.map(e => {
      const capacityPercent = Math.min(Math.round((e.registered_count / e.capacity) * 100), 100);
      const isSoldOut = e.seats_left <= 0;
      const isAlmostFull = !isSoldOut && e.seats_left <= Math.max(3, Math.ceil(e.capacity * 0.2));

      let badge = `<span class="badge-gold badge-general-cyan">${e.seats_left} seats open</span>`;
      let fillClass = '';

      if (isSoldOut) {
        badge = `<span class="badge-gold" style="background:rgba(244,63,94,0.15); color:var(--rose-accent); border:1px solid rgba(244,63,94,0.3);">CAPACITY REACHED</span>`;
        fillClass = 'danger';
      } else if (isAlmostFull) {
        badge = `<span class="badge-gold badge-vip-gold">LIMITED CAPACITY</span>`;
        fillClass = 'warning';
      }

      return `
        <div class="navy-card tilt-card event-navy-card" data-event-id="${e.id}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
            <h3 style="font-size: 1.3rem; font-weight: 700;">${this.escapeHTML(e.name)}</h3>
            ${badge}
          </div>

          <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
              <span style="color: var(--gold-bright);">${this.getSVGIcon('calendar')}</span>
              <span>${this.formatDate(e.date)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <span style="color: var(--gold-bright);">${this.getSVGIcon('venue')}</span>
              <span>${this.escapeHTML(e.venue)}</span>
            </div>
          </div>

          <div class="capacity-bar-box">
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
              <span style="color:#94a3b8;">Venue Capacity</span>
              <span><strong>${e.registered_count}</strong> / ${e.capacity} (${capacityPercent}%)</span>
            </div>
            <div class="capacity-bar-track">
              <div class="capacity-bar-fill ${fillClass}" style="width: ${capacityPercent}%;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <button class="btn-gold btn-sm btn-reg-card" 
              ${isSoldOut ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} 
              data-id="${e.id}">
              ${this.getSVGIcon('ticket')} Register
            </button>
            <button class="btn-navy-outline btn-sm btn-view-card" data-id="${e.id}">
              ${this.getSVGIcon('users')} Attendees
            </button>
            <button class="btn-danger-navy btn-sm btn-del-card" data-id="${e.id}" data-name="${this.escapeHTML(e.name)}">
              ${this.getSVGIcon('trash')}
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-reg-card').forEach(btn => {
      btn.addEventListener('click', (ev) => onRegisterClick(Number(ev.currentTarget.dataset.id)));
    });

    container.querySelectorAll('.btn-view-card').forEach(btn => {
      btn.addEventListener('click', (ev) => onViewClick(Number(ev.currentTarget.dataset.id)));
    });

    container.querySelectorAll('.btn-del-card').forEach(btn => {
      btn.addEventListener('click', (ev) => onDeleteClick(Number(ev.currentTarget.dataset.id), ev.currentTarget.dataset.name));
    });

    this.setupCardSpotlights();
  }

  // Render Executive Boarding Passes (Emoji Free)
  static renderAttendeesBoardingPasses(attendees, onDeleteClick) {
    const container = document.getElementById('attendees-display-container');
    const badge = document.getElementById('attendees-count-tag');
    if (!container) return;

    if (badge) badge.innerText = `${attendees.length} Attendees`;

    if (attendees.length === 0) {
      container.innerHTML = `
        <div class="navy-card" style="grid-column: 1 / -1; padding: 4rem; text-align: center;">
          <div style="color: var(--gold-bright); margin-bottom: 1rem;">${this.getSVGIcon('ticket')}</div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No Passes Issued</h3>
          <p style="color: #94a3b8; margin-bottom: 1.5rem;">Use the registration portal to issue official executive passes.</p>
          <button class="btn-gold" onclick="EventHorizonApp.switchSection('register-section')">${this.getSVGIcon('plus')} Register Attendee</button>
        </div>
      `;
      return;
    }

    container.className = 'tickets-grid';
    container.innerHTML = attendees.map(a => {
      let badgeClass = 'badge-general-cyan';
      if (a.ticket_type === 'VIP') badgeClass = 'badge-vip-gold';
      if (a.ticket_type === 'Student') badgeClass = 'badge-student-emerald';

      return `
        <div class="navy-card tilt-card ticket-pass-card">
          <div class="pass-head">
            <div>
              <span class="badge-gold ${badgeClass}">${a.ticket_type} PASS</span>
            </div>
            <div style="font-size: 0.8rem; color: #64748b; font-family: var(--font-display);">
              #EH-${a.id}
            </div>
          </div>

          <div class="pass-main">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${this.escapeHTML(a.name)}</h3>
            <p style="color: var(--gold-bright); font-size: 0.88rem; margin-bottom: 1rem;">${this.escapeHTML(a.email)}</p>

            <div style="background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">
              <div style="color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Event Title</div>
              <strong style="color: #fff;">${this.escapeHTML(a.event_name)}</strong>
              <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.25rem;">Date: ${this.formatDate(a.event_date)}</div>
            </div>
          </div>

          <div class="pass-foot">
            <div class="barcode">
              <div class="barcode-bar w-2"></div>
              <div class="barcode-bar w-1"></div>
              <div class="barcode-bar w-3"></div>
              <div class="barcode-bar w-1"></div>
              <div class="barcode-bar w-2"></div>
              <div class="barcode-bar w-3"></div>
            </div>

            <button class="btn-danger-navy btn-sm btn-del-pass" data-id="${a.id}" data-name="${this.escapeHTML(a.name)}">
              ${this.getSVGIcon('trash')} Revoke Pass
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-del-pass').forEach(btn => {
      btn.addEventListener('click', (ev) => onDeleteClick(Number(ev.currentTarget.dataset.id), ev.currentTarget.dataset.name));
    });

    this.setupCardSpotlights();
  }

  // Update Live Registration Pass Preview
  static updateLiveTicketPreview(name, email, ticketType, eventName) {
    const previewName = document.getElementById('preview-ticket-name');
    const previewEmail = document.getElementById('preview-ticket-email');
    const previewBadge = document.getElementById('preview-ticket-badge');
    const previewEvent = document.getElementById('preview-ticket-event');

    if (previewName) previewName.innerText = name.trim() || 'EXECUTIVE PASS HOLDER';
    if (previewEmail) previewEmail.innerText = email.trim() || 'delegate@sovereign.io';
    if (previewEvent) previewEvent.innerText = eventName || 'Select Target Event';

    if (previewBadge) {
      previewBadge.className = 'badge-gold';
      if (ticketType === 'VIP') {
        previewBadge.classList.add('badge-vip-gold');
        previewBadge.innerText = 'VIP PASS';
      } else if (ticketType === 'Student') {
        previewBadge.classList.add('badge-student-emerald');
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
