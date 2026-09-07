# AttendEase — HTML/CSS/JS Client-Side SPA

A lightweight, high-performance **Single Page Application (SPA)** for employee attendance management, leave tracking, monthly reporting, and a full-featured **Payroll & Salary Payment Engine** — built with pure **HTML5, Vanilla CSS3, and Modern JavaScript (ES6+)**.

---

## 🚀 Features

### 👤 Employee Portal
- **Interactive Dashboard**: View real-time personal attendance stats, check-in status, and quick action cards.
- **Check-In / Check-Out Widget**: One-click timestamp recording with automatic *Present* or *Late* status calculation and exact hours calculation.
- **Attendance Records**: Personal monthly attendance history filterable by month and year.
- **Leave Request Management**: Submit time-off requests (*Vacation*, *Sick Leave*, *Personal*, *Other*) with status tracking.
- **My Payslips & Tax Invoices**: Personal monthly payslip portal displaying YTD gross earnings, net salary received, overtime hours, TDS tax paid, and printable invoice documents.

### 🛡️ Admin Portal
- **Admin KPI Dashboard**: Live company-wide metrics showing today's present, late, absent, and on-leave counts.
- **Employee Management**: Create, edit, activate/deactivate, and delete employee profiles with a standardized 3-column action layout.
- **Attendance Records & Modal Editor**: Complete attendance history with multi-field filtering (*Employee*, *Date Range*, *Status*) and modal time record editor.
- **Leave Approval System**: Review, approve, or reject employee leave requests with custom reviewer notes.
- **Monthly Analytics & Reports**: Detailed breakdown of employee attendance rates, working hours, printable views (`window.print()`), and table summary totals.
- **Run Monthly Payroll Engine**: Batch payroll execution console with operational checks, active engine status indicators, and period selection.
- **Payroll Invoices & Register**: 12-column employee salary register table with month/year/status filters, 4 KPI summary cards (*Total Net Payout*, *Settled/Paid*, *Overtime Paid*, *TDS Tax Withheld*), tfoot totals row, **Mark Paid Modal** (with auto-prefilled `TXN...` reference IDs), and **Delete Batch Modal** (with a randomized 4-digit security captcha verification challenge).
- **Payroll Policy & Rules Console (7 Tabs)**:
  1. `💵 1. Salary & Earnings Structure`: Basic %, HRA %, Conveyance, Medical, and Special Allowance residual formula callout.
  2. `🛡️ 2. Deductions & Statutory Taxes`: PF %, TDS withholding %, Group Health Insurance, and Professional Tax (PT) slab rules.
  3. `⏱️ 3. Attendance, LOP & Overtime`: LOP formula, late arrival grace count, late penalties, and dual threshold Overtime engine (>8h/day, >40h/week, 1.5x multiplier).
  4. `🔀 4. Priority Cascade & Overrides`: 4-tier priority cascade (Employee > Position > Department Baseline > Universal Defaults) and department minimum base scales.
  5. `👔 5. Category Profiles`: Category chips, component splits, and employee category & salary mapping table.
  6. `🧪 6. Test Simulation & Preview`: Interactive dry-run simulator for testing draft payroll calculations before activation.
  7. `🏢 7. Payslip Branding & Entity`: Legal entity name, corporate address, GSTIN, contact email, signatory title, and certificate disclaimer.
- **Printable Tax Invoice View**: Official A4 printable tax invoice & salary certificate (`#invoice-view`) with company branding, employee meta grid, 6-metric attendance pill bar, side-by-side earnings vs deductions breakdown, number-to-words banner (Lakhs/Crores system), signatory seal, and custom line item modal.

---

## 🛠️ Technology Stack

- **Frontend Core**: HTML5 & Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS Design System with `Plus Jakarta Sans` typography, HSL color tokens, CSS Grid, and Flexbox layouts.
- **Architecture**: Single Page Application (SPA) with client-side hash routing (`window.location.hash`).
- **Data Persistence**: Browser `localStorage` (auto-seeded with initial demo data on first load).

---

## 📁 Directory Structure

```text
html-app/
├── index.html          # Application HTML shell & main SPA container
├── Payment.md          # Payroll architecture & payment engine documentation
├── css/
│   └── style.css       # Full CSS design system, layout tokens, and component styles
├── js/
│   └── app.js          # SPA router, state manager, seed data, and rendering engines
└── README.md
```

---

## 📦 Getting Started

### 1. Prerequisites
No build tools, Node.js, or backend servers are required! Works directly in any modern web browser.

### 2. How to Run

#### Option A: Direct File Open
Simply double-click **`index.html`** or drag and drop it into your preferred web browser (Chrome, Firefox, Edge, Safari).

#### Option B: Local Static Server (Recommended)
You can run a local HTTP server using Python or Node.js:

```bash
# Using Python 3:
cd html-app
python3 -m http.server 8000

# Using Node.js npx serve:
npx serve html-app
```
Then visit **`http://localhost:8000`** in your browser.

> 💡 **Note**: On initial launch, sample seed data (Admin user, demo employees, attendance records, leave requests, salary profiles, and invoices) is automatically created in browser `localStorage`.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `alice@company.com` | `employee123` |
| **Employee** | `bob@company.com` | `employee123` |
| **Employee** | `carol@company.com` | `employee123` |

---

## 🗺️ SPA Hash Routes

| Route | Access | Description |
| :--- | :--- | :--- |
| `#login` | Public | User authentication view |
| `#register` | Public | Employee self-registration |
| `#admin` | Admin | Company-wide dashboard & live stats |
| `#dashboard` | Employee | Personal dashboard & check-in portal |
| `#employees` | Admin | Employee management card grid |
| `#employee-form` | Admin | Add or edit employee details |
| `#admin-attendance` | Admin | Full attendance history & record editor |
| `#attendance` | Employee | Personal attendance history view |
| `#admin-leaves` | Admin | Review pending employee leave requests |
| `#leaves` | Employee | Personal leave request manager |
| `#reports` | Admin | Monthly attendance breakdown report |
| `#payroll` | Admin | Run Monthly Payroll execution console |
| `#invoices` | Admin | Payroll Invoices & Employee Salary Register |
| `#payroll-settings` | Admin | Payroll Policy & Rules Console (7 Tabs) |
| `#my-invoices` | Employee | Personal payslip history portal |
| `#invoice-view` | All | Printable Official Tax Invoice & Salary Certificate |
