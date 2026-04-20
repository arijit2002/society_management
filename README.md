# 🏢 Society Management System

> A complete desktop application for managing residential societies — fees, complaints, visitors, amenities, and more.

![Electron](https://img.shields.io/badge/Electron-29-47848F?style=flat-square&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=flat-square&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Features by Role](#-features-by-role)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Scripts](#-scripts)
- [Roadmap](#-roadmap)

---

## 🔍 Overview

Society Management System is an offline-first desktop application built with **Electron.js**. It supports four distinct user roles, each with a tailored interface and permissions.

```
┌─────────────────────────────────────────────────────┐
│              Society Management System              │
├──────────────┬──────────────┬──────────┬────────────┤
│    Admin /   │   Resident   │ Security │ Maintenance│
│  Committee   │              │  Guard   │   Staff    │
├──────────────┼──────────────┼──────────┼────────────┤
│ Full control │ Self-service │ Visitor  │   Task     │
│ of society   │   portal     │   gate   │ management │
└──────────────┴──────────────┴──────────┴────────────┘
                          │
              ┌───────────▼───────────┐
              │   SQLite Database     │
              │   (Local — Offline)   │
              └───────────────────────┘
```

---

## 🛠 Tech Stack

| Layer              | Technology              | Purpose                        |
|--------------------|-------------------------|--------------------------------|
| Desktop Shell      | Electron.js v29         | Cross-platform desktop app     |
| UI Framework       | React 18                | Component-based UI             |
| Styling            | TailwindCSS v3          | Utility-first CSS              |
| Database           | SQLite (better-sqlite3) | Local offline data storage     |
| State Management   | Zustand                 | Global auth state              |
| Charts             | Recharts                | Fee collection & stats graphs  |
| Icons              | Lucide React            | Consistent icon library        |
| Bundler            | Vite 5                  | Fast dev server & builds       |

---

## 🚀 Getting Started

### Prerequisites

Before installing, make sure you have the following:

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Python 3** with setuptools — required by node-gyp to compile SQLite

```bash
# Install Python setuptools if not already present
pip3 install setuptools
```

- **macOS:** Xcode Command Line Tools → `xcode-select --install`
- **Windows:** Visual Studio Build Tools with C++ workload
- **Linux:** `sudo apt install build-essential`

---

### Installation

```bash
# 1. Navigate to the project folder
cd "Society Management"

# 2. Install all dependencies
npm install

# 3. Rebuild SQLite native module for Electron's Node version
npm run rebuild

# 4. Launch the app in development mode
npm run dev
```

> **First launch:** The database is created automatically at `society_dev.db`
> in the project root and seeded with demo data.

---

### Build for Distribution

```bash
npm run dist
```

| Platform | Output |
|----------|--------|
| macOS    | `.dmg` installer in `release/` |
| Windows  | `.exe` NSIS installer in `release/` |
| Linux    | `.AppImage` in `release/` |

---

## 🔐 Demo Accounts

> Click the quick-login buttons on the left panel of the login screen to jump in instantly.

| Role               | Email                   | Password      |
|--------------------|-------------------------|---------------|
| 🛡️ Admin           | admin@society.com       | `admin123`    |
| 🏠 Resident        | john@society.com        | `resident123` |
| 🔒 Security Guard  | guard1@society.com      | `guard123`    |
| 🔧 Maintenance     | tech1@society.com       | `staff123`    |

---

## ✨ Features by Role

<details>
<summary><strong>🛡️ Admin / Society Committee</strong></summary>

&nbsp;

| Module | Features |
|---|---|
| **Dashboard** | Resident count, pending fees, open complaints, staff count, monthly collection bar chart, complaints-by-category pie chart, recent notices |
| **Residents** | Add / edit / deactivate residents, assign flats, set ownership type (Owner / Tenant) |
| **Maintenance Fees** | Bulk generate monthly records, mark as paid (Cash / UPI / Bank Transfer / Cheque), mark overdue, waive fees, auto receipt number generation |
| **Complaints** | View all complaints sorted by priority, assign to maintenance staff, update status, add resolution notes |
| **Notices** | Post announcements with priority (Normal / Important / Urgent), set expiry date, delete notices |
| **Amenities** | Manage society facilities, approve or reject resident booking requests |
| **Staff** | Add / edit / remove security guards and maintenance staff; set shift, designation, join date |
| **Reports** | Yearly fee collection vs pending bar chart, month-wise breakdown table with collection rate progress bars |

</details>

<details>
<summary><strong>🏠 Resident</strong></summary>

&nbsp;

| Module | Features |
|---|---|
| **Dashboard** | Current month fee status card (Paid / Pending / Overdue), total outstanding amount, recent complaints summary, latest notices |
| **My Fees** | Full payment history with receipt numbers, paid dates, and payment methods |
| **Complaints** | Raise new complaints (category + priority), track live status & resolution notes |
| **Amenities** | Browse available facilities with timings and capacity, submit booking requests, cancel pending bookings |
| **Notices** | Read all society announcements with priority highlighting |

</details>

<details>
<summary><strong>🔒 Security Guard</strong></summary>

&nbsp;

| Module | Features |
|---|---|
| **Dashboard** | Live counters for today's total visitors, currently inside, and exited; quick entry form |
| **Visitor Log** | Full log with date/status filters, entry & exit timestamps, vehicle number, host flat; one-click checkout |

</details>

<details>
<summary><strong>🔧 Maintenance Staff</strong></summary>

&nbsp;

| Module | Features |
|---|---|
| **Dashboard** | Pending / in-progress / completed / urgent task counters; quick start and complete actions |
| **My Tasks** | Filter by status, start tasks, mark complete with optional completion notes |

</details>

---

## 📁 Project Structure

```
Society Management/
│
├── electron/                        # Main process (Node.js / Electron)
│   ├── main.js                      # App entry — window creation, handler registration
│   ├── preload.js                   # Secure IPC bridge via contextBridge
│   │
│   ├── database/
│   │   ├── db.js                    # SQLite connection setup
│   │   ├── schema.js                # All table definitions (CREATE TABLE)
│   │   └── seed.js                  # Demo data seeded on first run
│   │
│   └── handlers/                    # IPC handlers — one file per module
│       ├── auth.js                  # Login, society info, password change
│       ├── residents.js             # Resident & flat CRUD
│       ├── fees.js                  # Fee generation, payment, overdue
│       ├── complaints.js            # Complaint lifecycle management
│       ├── notices.js               # Notice board
│       ├── visitors.js              # Gate entry & exit log
│       ├── amenities.js             # Facility management & bookings
│       ├── tasks.js                 # Maintenance work orders
│       ├── staff.js                 # Staff management
│       └── stats.js                 # Dashboard & report aggregations
│
├── src/                             # Renderer process (React / Vite)
│   ├── App.jsx                      # Router with role-based protected routes
│   ├── main.jsx                     # React entry point
│   ├── index.css                    # Tailwind base + custom component classes
│   │
│   ├── store/
│   │   └── authStore.js             # Zustand auth store (localStorage persisted)
│   │
│   ├── components/                  # Shared UI components
│   │   ├── Layout.jsx               # App shell (sidebar + main content)
│   │   ├── Sidebar.jsx              # Role-aware navigation sidebar
│   │   ├── Modal.jsx                # Reusable overlay modal
│   │   ├── Badge.jsx                # Status & priority badge helpers
│   │   ├── StatCard.jsx             # Dashboard metric cards
│   │   ├── Toast.jsx                # Toast notification system
│   │   └── ConfirmDialog.jsx        # Destructive action confirmation
│   │
│   └── pages/
│       ├── auth/
│       │   └── Login.jsx            # Login screen with quick-demo buttons
│       ├── admin/
│       │   ├── Dashboard.jsx
│       │   ├── Residents.jsx
│       │   ├── Fees.jsx
│       │   ├── Complaints.jsx
│       │   ├── Notices.jsx
│       │   ├── Amenities.jsx
│       │   ├── Staff.jsx
│       │   └── Reports.jsx
│       ├── resident/
│       │   ├── Dashboard.jsx
│       │   ├── MyFees.jsx
│       │   ├── Complaints.jsx
│       │   ├── Amenities.jsx
│       │   └── Notices.jsx
│       ├── security/
│       │   ├── Dashboard.jsx
│       │   └── Visitors.jsx
│       └── maintenance/
│           ├── Dashboard.jsx
│           └── Tasks.jsx
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── society_dev.db                   # SQLite DB — auto-created on first run
└── README.md
```

---

## 🗄 Database Schema

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│    users     │────<│ maintenance_fees  │     │    flats     │
│──────────────│     │───────────────────│     │──────────────│
│ id           │     │ id                │     │ id           │
│ name         │     │ resident_id (fk)  │     │ flat_no      │
│ email        │     │ flat_id (fk)      │>────│ block        │
│ password     │     │ amount            │     │ floor        │
│ role         │     │ month / year      │     │ ownership    │
│ flat_no      │     │ status            │     │ user_id (fk) │
│ block        │     │ paid_date         │     └──────────────┘
│ is_active    │     │ receipt_no        │
└──────┬───────┘     └───────────────────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────┐                  ┌───────────────┐
│  complaints  │                  │   visitors    │
│──────────────│                  │───────────────│
│ resident_id  │                  │ visitor_name  │
│ title        │                  │ host_flat     │
│ category     │                  │ guard_id (fk) │
│ priority     │                  │ entry_time    │
│ status       │                  │ exit_time     │
│ assigned_to  │                  │ status        │
└──────────────┘                  └───────────────┘

┌──────────────┐     ┌───────────────────┐
│  amenities   │────<│ amenity_bookings  │
│──────────────│     │───────────────────│
│ name         │     │ amenity_id (fk)   │
│ capacity     │     │ resident_id (fk)  │
│ open_time    │     │ booking_date      │
│ close_time   │     │ start/end_time    │
└──────────────┘     │ status            │
                     └───────────────────┘

┌──────────────┐     ┌───────────────────┐
│    tasks     │     │  staff_details    │
│──────────────│     │───────────────────│
│ title        │     │ user_id (fk)      │
│ assigned_to  │     │ department        │
│ priority     │     │ designation       │
│ status       │     │ shift             │
│ due_date     │     │ join_date         │
└──────────────┘     └───────────────────┘
```

---

## ⚡ Scripts

```bash
npm run dev        # Start Vite dev server + Electron (development mode)
npm run build      # Build React app with Vite only
npm run dist       # Build React + package Electron app for distribution
npm run rebuild    # Rebuild better-sqlite3 for Electron's Node version
```

> Run `npm run rebuild` whenever you update the `electron` version in `package.json`.

---

## 🗺 Roadmap

### Phase 2 — Online Sync
- [ ] Cloud backend — Node.js + PostgreSQL
- [ ] Multi-device data sync
- [ ] Role-based web portal (browser access)

### Phase 3 — Mobile
- [ ] iOS & Android app via Capacitor.js
- [ ] Shared React codebase with desktop

### Phase 4 — Feature Enhancements
- [ ] Payment gateway integration (Razorpay / Stripe)
- [ ] Visitor pre-approval by residents (WhatsApp / SMS OTP)
- [ ] Document storage — society bye-laws, NOCs, agreements
- [ ] Export reports to PDF / Excel
- [ ] Society settings page (name, logo, default fee amount)
- [ ] Push notifications for fee reminders
- [ ] Multi-society support

---

## 📝 Notes

- **Offline-first** — all data is stored locally. No internet required.
- **Passwords** are hashed with bcryptjs before storage — never stored in plain text.
- **Role-based routing** — each role can only access its own screens.
- The SQLite schema is designed to migrate cleanly to **PostgreSQL** when moving online.
- The development database (`society_dev.db`) can be deleted at any time to reset to demo data.
