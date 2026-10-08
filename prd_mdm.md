## PRD — Event & Attendee Management System

Product name (working): EventHorizon Version: 1.0 | Status: Draft for build | Type: Full-stack CRUD web application Stack: HTML5, CSS3, Vanilla JavaScript (Fetch/AJAX) · Node.js + Express.js · SQLite

## 1. Overview

EventHorizon is a web application that lets organisers create events, register attendees, search records and delete entries — all without page reloads. It demonstrates complete full-stack CRUD: a dynamic client, a REST API built on Express middleware and routing, and a relational SQLite database with a one-to-many relationship between Events and Attendees.

## 2. Problem Statement

Small organisers (college clubs, workshops, meetups) track registrations in spreadsheets or chats. This causes duplicate registrations, invalid emails, overbooked events and slow lookups. They need one lightweight tool that validates input, enforces capacity and gives instant search.

## 3. Goals and Non-Goals

## Goals

- Add, list, search, register and delete events and attendees through a clean UI.

- Enforce data integrity: required fields, valid email, no duplicate registration, capacity limit.

- Update the UI dynamically (no reloads) using Fetch/AJAX with JSON.

- Deliver a premium, modern glassmorphism interface.

## Non-Goals (v1)

- User authentication / roles, payments, email notifications, QR check-in, multi-tenant support.

## 4. Target Users

| Persona | Need |
| --- | --- |
| Event Organiser | Create events, see who registered, remove records |
| Registration Desk Staff | Quickly search attendees by name or event |

Evaluator / Student (academic use) Demonstrate working full-stack CRUD and testing

## 5. Scope and Features

## 5.1 Event Management

- Create event with Event Name, Date, Venue, Capacity.

- List all events as cards with live seat count (registered / capacity).

- Delete an event (cascades to its attendees, with confirmation modal).

## 5.2 Attendee Management

- Register attendee with Name, Email, Ticket Type (General / VIP / Student) to a selected event.

- List attendees per event.

- Search attendees by name, email or event (debounced, live results).

- Delete an attendee record.

## 5.3 Validation Rules

| Rule | Behaviour |
| --- | --- |
| Required fields | Name, Email, Ticket Type, Event must be present |
| Email format | Must match a valid email pattern (client + server) |
| Duplicate registration Same email cannot register twice for the same event (409) |   |
| Non-existent event Registration returns 404 |   |
| Full event | Registration returns 409 "Event is full" |
| Past date | Event date cannot be in the past |

## 5.4 Feedback and UX

- Toast notifications for success and error.

- Skeleton loaders, empty states, inline field errors.

- Fully responsive (mobile, tablet, desktop).

## 6. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-1 User can create an event with name, date, venue, capacity P0 |   |   |
| FR-2 User can view all events |   | P0 |
| FR-3 User can register an attendee for an event |   | P0 |
| FR-4 System rejects duplicate registrations |   | P0 |
| FR-5 System validates email and required fields |   | P0 |


- FR-6 User can search attendees by name / email / event FR-7 User can delete an attendee FR-8 User can delete an event (cascade) FR-9 UI updates without page reload P0

- P0

- P0

- P0

- FR-10 System blocks registration to full or non-existent events P1

- FR-11 Dashboard stats (total events, attendees, seats left) FR-12 Filter attendees by ticket type P1

P2

## 7. System Architecture

[ Browser: HTML/CSS/JS ] --Fetch (JSON)--> [ Express.js API ] --SQL--> [ SQLite ]

- UI + validation routes, middleware, validation events, attendees

Express middleware stack: express.json() → static file server → request logger → route handlers → validation middleware → centralised error handler.

## Suggested Folder Structure

## eventhorizon/

├── server.js ├── db/ │ ├── database.js # SQLite connection + schema init │ └── eventhorizon.db ├── routes/ │ ├── events.js │ └── attendees.js ├── middleware/ │ ├── validate.js │ └── errorHandler.js └── public/ ├── index.html ├── css/styles.css └── js/

├── app.js ├── api.js └── ui.js

## 8. Database Design (One-to-Many)

## events

| Column Type |   | Constraints |
| --- | --- | --- |
| id | INTEGER PK, AUTOINCREMENT |   |
| name | TEXT | NOT NULL |
| date | TEXT | NOT NULL |
| venue | TEXT | NOT NULL |
| capacity | INTEGER NOT NULL, > 0 |   |
| created_at DATETIME DEFAULT CURRENT_TIMESTAMP |   |   |

## attendees

## Column Type Constraints

| id | INTEGER PK, AUTOINCREMENT |   |
| --- | --- | --- |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| ticket_type TEXT |   | CHECK IN ('General','VIP','Student') |
| event_id | INTEGER FK → events(id) ON DELETE CASCADE |   |
| created_at DATETIME DEFAULT CURRENT_TIMESTAMP |   |   |
|   |   | UNIQUE(email, event_id) |

UNIQUE(email, event_id)

## 9. REST API Specification

| Method Endpoint | Description | Success Errors |   |
| --- | --- | --- | --- |
| POST /api/events | Create event | 201 | 400 |
| GET /api/events | List events with seat counts 200 — |   |   |


| GET | /api/events/:id | Event + its attendees | 200 | 404 |
| --- | --- | --- | --- | --- |
| DELETE /api/events/:id |   | Delete event (cascade) | 200 | 404 |
| POST /api/events/:id/register |   | Register attendee | 201 | 400, 404, 409 |
| GET | /api/attendees?q=&event_id=&ticket= Search / list attendees |   | 200 — |   |
| DELETE /api/attendees/:id |   | Delete attendee | 200 | 404 |
| GET | /api/stats | Dashboard counts | 200 — |   |

## Standard response shape

- { "success": true, "data": {}, "message": "Attendee registered" }

{ "success": false, "error": "Email already registered for this event" }

## 10. UX / UI Requirements

## 10.1 Design Language

Dark, futuristic glassmorphism with glowing gradient accents, soft neon shadows and fluid micro-animations.

Token

Background

Primary gradient Violet #7C3AED → Indigo #4F46E5 → Cyan #22D3EE

Accent gradient Magenta #EC4899 → Orange #F59E0B

Success / Error #34D399 / #FB7185

Glass surface

Glow

Radius

Fonts

Value

Deep midnight #07071A with animated aurora gradient mesh

rgba(255,255,255,0.06), backdrop-filter: blur(20px), 1px border rgba(255,255,255,0.12)

box-shadow: 0 0 40px rgba(124,58,237,0.35)

20–28px

Headings: Space Grotesk / Sora · Body: Inter

## 10.2 Motion

- Floating blurred gradient orbs in the background (slow drift).

- Page-load staggered fade-up reveal; scroll-triggered reveal for sections.

- Card hover: lift, tilt, animated gradient border and glow.

- Animated count-up numbers on stat cards.

- Modal: scale + blur-in; list items slide in/out on add/delete.

- Buttons: gradient shimmer and ripple on click.

- Respect prefers-reduced-motion.

## 10.3 Screens and Flow

- 1. Landing / Hero — headline, tagline, CTA buttons (Create Event, Register Attendee), floating glass preview cards.

- 2. Dashboard — 4 stat cards (Total Events, Total Attendees, Seats Left, Upcoming).

- 3. Events — grid of glass event cards with capacity progress bar, "Register" and "Delete" actions; "+ New Event" opens a modal.

- 4. Register Attendee — glass form (event dropdown, name, email, ticket type pills) with inline validation.

- 5. Attendees — sticky search bar, filter chips (event, ticket type), animated table/list with delete action.

- 6. System feedback — toasts, confirmation modal, empty and loading states.

User flow: Landing → Dashboard → Create Event → Register Attendee → Search Attendees → Delete Attendee / Event.

## 11. Non-Functional Requirements

- Performance: API response < 200 ms locally; First Contentful Paint < 2 s.

- Security: Parameterised SQL queries (no injection), input sanitisation, escaped output (no XSS), CORS configured.

- Accessibility: WCAG AA contrast on glass surfaces, keyboard navigation, visible focus rings, ARIA labels.

- Compatibility: Latest Chrome, Edge, Firefox, Safari; backdrop-filter fallback to solid translucent background.

- Maintainability: Modular routes, separated API/UI JS modules, consistent error handling.

## 12. Test Plan

- ID Scenario T1 Create event with all fields T2 Create event with missing field T3 Register valid attendee T4 Register with invalid email 201, appears instantly in list

- 400, inline error

- 201, seat count increases

- 400, error toast

- T5 Register same email twice for same event 409 duplicate

## Expected


| T6 Register to non-existent event ID | 404 |
| --- | --- |
| T7 Register to a full event T8 Search by partial name T9 Delete attendee | 409 "Event is full" |
|   | Matching results, no reload |
|   | Removed with animation, seat freed |
| T10 Delete event | Event and its attendees removed |

## 13. Success Metrics

- 100% of listed objectives implemented and demonstrable.

- All 10 test cases pass.

- Zero page reloads during any CRUD action.

- Lighthouse Performance and Accessibility e 90.

## 14. Milestones

## Phase Deliverable

- 1 DB schema + Express server setup

- 2 Events and Attendees REST APIs with validation

- 3 4 5 Testing, bug fixes, report/demo

- Search, filters, animations, polish

- Frontend UI from Stitch + Fetch integration

## 15. Risks and Mitigations

## Risk Mitigation

Race condition on last seat Stitch output uses inline/static data

Glass blur hurts performance on low-end devices Limit blurred layers, use fallback and reduced-motion

Check capacity inside a SQLite transaction Replace with API calls in api.js and ui.js
