# Society Management System

A desktop application for managing residential societies, built with **Electron.js + React + SQLite**. Supports four user roles — Admin, Resident, Security Guard, and Maintenance Staff.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron.js v29 |
| UI Framework | React 18 + TailwindCSS |
| Database | SQLite via better-sqlite3 |
| State Management | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| Bundler | Vite |

---

## Getting Started

### Prerequisites

- Node.js v18+ (tested on v23)
- npm v9+
- Python 3 with setuptools (`pip3 install setuptools`)
- Xcode Command Line Tools (macOS) or build-essential (Linux)

### Installation

```bash
# Clone or open the project folder
cd "Society Management"

# Install dependencies
npm install

# Rebuild better-sqlite3 for Electron's Node version
npm run rebuild

# Start the app in development mode
npm run dev
```

### Build for Distribution

```bash
npm run dist
```

Output will be in the `release/` folder.

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin / Committee | admin@society.com | admin123 |
| Resident | john@society.com | resident123 |
| Security Guard | guard1@society.com | guard123 |
| Maintenance Staff | tech1@society.com | staff123 |

> Quick-login buttons are available on the left panel of the login screen for easy demo access.

---

## Features by Role

### Admin / Society Committee
- **Dashboard** — Stats overview: residents, pending fees, open complaints, staff count, visitor count, monthly collection chart, complaints by category
- **Residents** — Add, edit, deactivate residents; assign flats; track ownership type (owner/tenant)
- **Maintenance Fees** — Bulk generate monthly fee records, mark fees as paid (cash/UPI/bank transfer/cheque), mark overdue, waive fees, receipt generation
- **Complaints** — View all complaints, assign to maintenance staff, update status and priority, add resolution notes
- **Notices** — Post announcements with priority levels (Normal / Important / Urgent), set expiry dates
- **Amenities** — Manage society facilities, approve or reject booking requests from residents
- **Staff Management** — Add/edit/remove security guards and maintenance staff with shift and designation info
- **Reports** — Yearly fee collection charts and month-wise collection vs pending breakdown

### Resident
- **Dashboard** — Current month fee status alert, recent complaints summary, latest notices
- **My Fees** — Full payment history with receipt numbers and payment methods
- **Complaints** — Raise new complaints with category and priority, track resolution status
- **Amenities** — Browse available facilities, submit booking requests, cancel pending bookings
- **Notices** — Read all society announcements

### Security Guard
- **Dashboard** — Live count of today's visitors (total / currently inside / exited), quick entry form
- **Visitor Log** — Full log with date filters, log entry/exit times, vehicle numbers, checkout visitors

### Maintenance Staff
- **Dashboard** — Pending and in-progress task queue with quick start/complete actions
- **My Tasks** — Filter by status, start tasks, mark complete with completion notes

---

## Project Structure

```
Society Management/
├── electron/
│   ├── main.js                  # Electron main process
│   ├── preload.js               # IPC bridge (contextBridge)
│   ├── database/
│   │   ├── db.js                # SQLite connection
│   │   ├── schema.js            # Table definitions
│   │   └── seed.js              # Demo data
│   └── handlers/
│       ├── auth.js              # Login, society info, password change
│       ├── residents.js         # Resident & flat CRUD
│       ├── fees.js              # Maintenance fee management
│       ├── complaints.js        # Complaint management
│       ├── notices.js           # Notice board
│       ├── visitors.js          # Visitor entry/exit log
│       ├── amenities.js         # Facility bookings
│       ├── tasks.js             # Maintenance task management
│       ├── staff.js             # Staff management
│       └── stats.js             # Dashboard statistics
├── src/
│   ├── App.jsx                  # Router + role-based protected routes
│   ├── main.jsx
│   ├── index.css                # Tailwind + global styles
│   ├── store/
│   │   └── authStore.js         # Zustand auth store (persisted)
│   ├── components/
│   │   ├── Layout.jsx           # App shell with sidebar
│   │   ├── Sidebar.jsx          # Role-based navigation
│   │   ├── Modal.jsx            # Reusable modal
│   │   ├── Badge.jsx            # Status/priority badges
│   │   ├── StatCard.jsx         # Dashboard stat cards
│   │   ├── Toast.jsx            # Toast notifications
│   │   └── ConfirmDialog.jsx    # Delete confirmation dialog
│   └── pages/
│       ├── auth/Login.jsx
│       ├── admin/               # Dashboard, Residents, Fees, Complaints,
│       │                        # Notices, Amenities, Staff, Reports
│       ├── resident/            # Dashboard, MyFees, Complaints,
│       │                        # Amenities, Notices
│       ├── security/            # Dashboard, Visitors
│       └── maintenance/         # Dashboard, Tasks
├── package.json
├── vite.config.js
├── tailwind.config.js
└── society_dev.db               # SQLite database (auto-created on first run)
```

---

## Database

The SQLite database is created automatically on first launch:

- **Development:** `society_dev.db` in the project root
- **Production build:** `~/Library/Application Support/society-management/society.db` (macOS)

The database is seeded with demo data (residents, flats, fees, complaints, notices, visitors, tasks) on first run.

### Tables

| Table | Description |
|---|---|
| `users` | All users across all roles |
| `flats` | Flat/unit registry |
| `maintenance_fees` | Monthly fee records per resident |
| `complaints` | Resident complaints |
| `notices` | Society announcements |
| `visitors` | Gate entry/exit log |
| `amenities` | Society facilities |
| `amenity_bookings` | Facility booking requests |
| `tasks` | Maintenance work orders |
| `staff_details` | Extended info for security/maintenance staff |
| `society_info` | Society name, address, default fee amount |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server + Electron in development mode |
| `npm run build` | Build React app with Vite |
| `npm run dist` | Build React + package Electron app for distribution |
| `npm run rebuild` | Rebuild better-sqlite3 for Electron's Node version |

---

## Roadmap (Planned)

- [ ] Online sync / cloud backend (PostgreSQL + Node.js API)
- [ ] Mobile app (Capacitor.js — iOS & Android)
- [ ] Visitor pre-approval by residents
- [ ] Document storage (society bye-laws, NOCs)
- [ ] Payment gateway integration (Razorpay)
- [ ] Push notifications
- [ ] Export reports to PDF / Excel
- [ ] Society settings page (change society name, fee amount, etc.)
- [ ] Multi-society support

---

## Notes

- All data is stored **locally** on the device. No internet connection required.
- Passwords are hashed using bcryptjs before storage.
- The app uses role-based access control — each role sees only its own screens.
- When shifting to an online version, the SQLite schema is designed to map directly to PostgreSQL.
