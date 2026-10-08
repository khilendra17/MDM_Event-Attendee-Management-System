# EventHorizon — Event & Attendee Management System 🌌

EventHorizon is a full-stack, real-time CRUD web application built for event organisers, workshops, and meetups. It features a modern glassmorphic interface, dynamic zero-reload DOM updates via Fetch/AJAX, input validation, capacity enforcement, search filtering, and an Express + SQLite backend.

---

## ✨ Features

- **Event Directory**: Create, list, search, and delete events with live capacity indicators.
- **Attendee Management**: Register attendees with ticket types (`General`, `VIP`, `Student`) and instant search.
- **Data Integrity & Validation**:
  - Enforces required fields, email format checks, and past-date protection.
  - Prevents overbooking (capacity limit checks in SQLite transactions).
  - Blocks duplicate registrations (same email for the same event).
- **Cascading Deletions**: Deleting an event cleanly cascades and removes associated attendees.
- **Futuristic Glassmorphism UI**: High-contrast theme with HSL glowing accents, dynamic visual seat indicators, animated count-ups, skeleton loaders, and responsive toasts.
- **Automated Test Suite**: Full PRD compliance test coverage (T1 – T10 test suite).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism & CSS Variables), Vanilla JavaScript (AJAX/Fetch)
- **Backend**: Node.js, Express.js middleware stack
- **Database**: SQLite (`better-sqlite3`) with foreign keys enabled
- **Testing**: Node.js Native Test Runner (`node --test`) + `supertest`

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Application
```bash
npm start
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Running Tests

Execute the automated backend API test suite verifying all 10 PRD specifications:
```bash
npm test
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/events` | Create a new event |
| `GET` | `/api/events` | List events with seat counts |
| `GET` | `/api/events/:id` | Get event details with registered attendees |
| `DELETE` | `/api/events/:id` | Delete event (cascades to attendees) |
| `POST` | `/api/events/:id/register` | Register attendee for an event |
| `GET` | `/api/attendees` | Search / filter attendees |
| `DELETE` | `/api/attendees/:id` | Remove attendee record |
| `GET` | `/api/stats` | Dashboard statistics summary |

---

## 📄 License

ISC License.
