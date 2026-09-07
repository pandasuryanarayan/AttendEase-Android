# AttendEase Android — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Draft  
**Target Platform:** Android (Kotlin, Jetpack Compose or XML + Kotlin)  
**Source of Truth:** `html-app/` (HTML/CSS/JS SPA)  
**Local Persistence:** Android Room Database (built-in SQLite)  
**Goal:** Build a native Android app that is feature-identical, visually identical, and behaviorally identical to the existing `html-app` implementation.

---

## 1. Executive Summary

AttendEase is an **Employee Attendance Management & Payroll Automation Suite**. The Android app must replicate the full-featured web SPA as a native mobile experience, preserving all business logic, color tokens, typography, iconography, and user flows.

---

## 2. Functional Requirements

### 2.1 Authentication & User Management

| Feature | Description |
|---------|-------------|
| **Login** | Email + password authentication with password visibility toggle |
| **Register** | Self-registration for employees (first name, last name, email, password, department, position) |
| **Session** | Persistent logged-in session (shared preferences / encrypted storage) |
| **Roles** | Two roles: `admin` and `employee` |
| **Logout** | Sign out with flash notification |

**Default Credentials:**
- Admin: `admin@company.com` / `admin123`
- Employee: `alice@company.com` / `employee123` (and others)

---

### 2.2 Employee Portal (Role: `employee`)

| Screen | Route Equivalent | Features |
|--------|------------------|----------|
| **Dashboard** | `#dashboard` | Greeting (Morning/Afternoon/Evening), live clock, check-in/out widget, monthly stats (working days, present, absent, late, hours worked, attendance rate), quick actions, recent attendance table, profile summary |
| **Attendance History** | `#attendance` | Personal monthly attendance records, filter by month/year, pagination, status badges |
| **Leave Requests** | `#leaves` | Submit new leave request (Vacation, Sick, Personal, Other), view history, cancel pending requests, status tracking |
| **My Payslips** | `#my-invoices` | YTD gross/net/tax/OT KPI cards, payslip history table, view/download invoice |
| **Invoice View** | `#invoice-view` | Printable tax invoice & salary certificate with company branding, employee meta grid, attendance pill bar, earnings vs deductions split, net pay banner, signatory seal |

---

### 2.3 Admin Portal (Role: `admin`)

| Screen | Route Equivalent | Features |
|--------|------------------|----------|
| **Admin Dashboard** | `#admin` | KPI cards (total employees, present today, absent today, on leave), pending leave alert, 7-day bar chart, today's check-ins table, quick nav grid |
| **Employees** | `#employees` | Employee card grid, search by name/email, filter by department, activate/deactivate, delete, edit |
| **Employee Form** | `#employee-form` | Add/edit employee (personal info, work info, password), email immutable on edit |
| **Attendance Records** | `#admin-attendance` | All attendance history, multi-field filters (employee, date range, status), edit modal with datetime pickers |
| **Leave Management** | `#admin-leaves` | Tab bar filters (Pending/Approved/Rejected/All), review modal with approve/reject and admin notes |
| **Analytics & Reports** | `#reports` | Monthly attendance breakdown, employee table with progress bars, summary stats, print support |
| **Run Monthly Payroll** | `#payroll` | Month/year picker, operational check list, execute payroll engine, status indicators, navigation to invoices |
| **Payroll Invoices & Register** | `#invoices` | 12-column salary register table, 4 KPI summary cards, month/year/status filters, Download PDF, View, Pay actions, batch delete with 4-digit captcha, tfoot totals row |
| **Payroll Policy & Rules** | `#payroll-settings` | 7-tab console: Salary Structure, Deductions & Taxes, Attendance/LOP/OT, Priority Cascade & Overrides, Category Profiles, Test Simulation, Payslip Branding |
| **Invoice View (Admin)** | `#invoice-view` | Same as employee but with Add Line Item and Record Payment actions |

---

### 2.4 Core Business Logic (Must Be Ported Exactly)

#### 2.4.1 Attendance & Check-In/Out
- **Check-In:** Records timestamp, calculates status (`present` if before 09:15, else `late`)
- **Check-Out:** Records timestamp, calculates `hours_worked` in decimal
- **Working Days:** Count weekdays between two dates (exclude weekends)
- **Seed Data:** 30 days of demo attendance for 4 employees on first launch

#### 2.4.2 Leave Management
- Types: `vacation`, `sick`, `personal`, `other`
- Status lifecycle: `pending` → `approved` / `rejected`
- Days calculated as `floor((end - start) / 86400000) + 1`
- Admin can add notes on review

#### 2.4.3 Payroll Engine (`calculatePayroll`)

**Priority Cascade (4-Tier):**
1. Employee-Specific Override (highest)
2. Position/Designation Exception
3. Department Baseline Scale
4. Company Default Rules (fallback)

**Effective Base CTC:** `max(Individual Base, Category Benchmark, Department Baseline)`

**Earnings:**
- Basic = `Effective Base CTC × basic_percentage%` (default 50%)
- HRA = `Basic × hra_percentage%` (default 40%, overridable by department/position)
- Special Allowance = Residual to match gross
- Conveyance = Fixed ₹2,000/month
- Medical = Fixed ₹1,500/month
- Overtime Pay = `OT Hours × (Base / (WorkingDays × 8)) × Multiplier`

**Deductions:**
- LOP = `(Base / WorkingDays) × AbsentDays`
- Late Penalty: 2 free grace passes/month; 3rd+ late = half-day penalty (or flat/quarter-day based on config)
- PF = `Basic × pf_rate%` (default 6%)
- TDS = `Gross Earnings × tds_rate%` (default 10%)
- Professional Tax: Slab-based (₹0 if gross ≤ ₹7,500; ₹175 if ₹7,501–₹10,000; ₹200 if > ₹10,000)
- Health Insurance = Fixed ₹500/month

**Overtime (Dual-Threshold):**
- Daily: hours > 8.0 hrs/day
- Weekly: hours > 40.0 hrs/week
- Multiplier: 1.5x (configurable)

**Net Payable:** `Gross Earnings - Total Deductions`

#### 2.4.4 Invoice Generation
- Invoice Number: `INV-{year}-{monthPadded}-000{emp.id}`
- Statuses: `approved`, `paid`, `pending`
- Payment modes: NEFT, RTGS, IMPS, UPI, Corporate Cheque
- Transaction ref: Auto-prefixed with `TXN` + random 8-digit number
- Batch delete with 4-digit numeric captcha challenge

---

## 3. Non-Functional Requirements

### 3.1 Design & Theming

**Typography:**
- Primary Font Family: `Plus Jakarta Sans` (include as asset or use system fallback: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`)
- Secondary Font Family: `Inter` (for numeric data, monospace elements)
- Font weights: 400, 500, 600, 700, 800

**Color Tokens (must be replicated exactly):**

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--primary` | `#6366f1` | Primary buttons, active states, links |
| `--primary-dark` | `#4f46e5` | Hover states |
| `--primary-light` | `#eef2ff` | Light backgrounds, badges |
| `--primary-glow` | `rgba(99,102,241,0.25)` | Focus rings |
| `--success` | `#10b981` | Success badges, present status |
| `--success-dark` | `#059669` | Success hover |
| `--success-light` | `#ecfdf5` | Success backgrounds |
| `--danger` | `#f43f5e` | Danger badges, delete actions |
| `--danger-dark` | `#e11d48` | Danger hover |
| `--danger-light` | `#fff1f2` | Danger backgrounds |
| `--warning` | `#f59e0b` | Warning badges, late status |
| `--warning-dark` | `#d97706` | Warning hover |
| `--warning-light` | `#fffbeb` | Warning backgrounds |
| `--info` | `#06b6d4` | Info badges |
| `--info-light` | `#ecfeff` | Info backgrounds |
| `--purple` | `#a855f7` | Accent elements |
| `--purple-light` | `#faf5ff` | Purple backgrounds |
| `--bg` | `#f1f5f9` | Main background |
| `--surface` | `#ffffff` | Card surfaces |
| `--surface-secondary` | `#f8fafc` | Secondary surfaces |
| `--border` | `#e2e8f0` | Borders |
| `--border-dark` | `#cbd5e1` | Darker borders, input borders |
| `--text` | `#0f172a` | Primary text |
| `--text-muted` | `#64748b` | Secondary text |
| `--text-light` | `#94a3b8` | Tertiary text |

**Gradients:**
- Sidebar: `linear-gradient(180deg, #0f172a 0%, #1e1b4b 60%, #111827 100%)`
- Auth Background: `radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 100%)`
- Check-in Card: `linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)`
- Net Pay Banner: `linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)`
- Brand Logo: `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`
- Avatar: `linear-gradient(135deg, #818cf8 0%, #c084fc 100%)`

**Spacing Tokens:**
- `--space-xs: 6px`
- `--space-sm: 10px`
- `--space-md: 14px`
- `--space-lg: 20px`
- `--space-xl: 26px`
- `--space-2xl: 32px`

**Component Dimensions:**
- Sidebar Width: `260dp`
- Topbar Height: `70dp`
- Radius Large: `16dp` (cards, modals, auth box)
- Radius Medium: `12dp` (hero banners, stat cards)
- Radius Small: `8dp` (buttons, inputs, badges)

**Shadows:**
- `--shadow-sm`: `0 1px 2px 0 rgba(0,0,0,0.05)`
- `--shadow`: `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)`
- `--shadow-md`: `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)`
- `--shadow-lg`: `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.04)`

**Transitions:** `0.22s cubic-bezier(0.4, 0, 0.2, 1)`

### 3.2 Icons

All icons must be replicated as Android Vector Drawables (or Material Icons with custom tinting). Key SVG paths from the web app must be converted:

| Icon | Path Data |
|------|-----------|
| Calendar | `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>` |
| Users | `<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2"/>` |
| Check Circle | `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>` |
| X Circle | `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>` |
| Clock | `<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>` |
| Log Out | `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>` |
| Plus | `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>` |
| Download | `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>` |
| Trash | `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v11m4-11v11m4-11v11"/>` |
| Eye / Eye Off | Standard Material Icons or custom paths |
| Settings | `<circle cx="12" cy="12" r="3"/><path d="M19.4 15..."/>` (full path from source) |
| File Text | `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>` |
| Credit Card | `<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>` |

**App Icon / Favicon:**
- Vector drawable matching the SVG at `html-app/favicon.svg`
- Calendar icon with rounded rectangle and two top tabs

### 3.3 Data Persistence (Room Database)

Replace `localStorage` with **Android Room** entities:

| Entity | Fields |
|--------|--------|
| `User` | id, firstName, lastName, email, passwordHash, role, department, position, phone, hireDate, isActive, createdAt |
| `AttendanceRecord` | id, userId, date, checkIn, checkOut, hoursWorked, status, notes, createdAt |
| `LeaveRequest` | id, userId, leaveType, startDate, endDate, daysRequested, reason, status, adminNote, reviewedAt, createdAt |
| `SalaryProfile` | userId, employeeTypeId, baseSalary, bankName, bankAccountNo, bankIfsc, panNo |
| `Invoice` | id, invoiceNumber, userId, month, year, status, workingDays, presentDays, lateDays, paidLeaves, absentDays, totalHours, overtimeHours, standardHourlyRate, otMultiplier, baseSalary, effectiveBaseSalary, deptBaseSalary, appliedSalaryReason, department, basicPay, basicPercentage, hra, hraPercentage, specialAllowance, conveyanceAllowance, medicalAllowance, overtimePay, typeCustomEarnings, bonus, grossEarnings, lopDeduction, lateDeduction, pfDeduction, pfPercentage, tdsTax, tdsPercentage, insurance, professionalTax, typeCustomDeductions, totalDeductions, netPay, customLineItems, paymentMode, transactionRef, paidAt, createdAt |
| `PayrollRule` | id (singleton), ruleStatus, version, effectiveFrom, company (JSON), globalRules (JSON), salaryStructure (JSON), deductionsConfig (JSON), attendanceLopConfig (JSON), overtimeConfig (JSON), departmentRules (JSON), overrides (JSON), employeeTypes (JSON) |

**Seed Data:** Auto-seed on first launch (same data as web app).

---

## 4. Architecture

### 4.1 Recommended Stack
- **Language:** Kotlin
- **UI Framework:** Jetpack Compose (preferred) or XML with ViewBinding
- **Architecture:** MVVM + Repository Pattern
- **Database:** Room (SQLite)
- **Navigation:** Jetpack Navigation Component (Compose Navigation or Fragment-based)
- **Dependency Injection:** Hilt (optional but recommended)
- **Date/Time:** `java.time` (API 26+) or ThreeTenABP for backwards compatibility
- **Currency Formatting:** `NumberFormat.getCurrencyInstance(Locale("en", "IN"))`
- **PDF Generation:** `android.print.PrintHelper` or a library like `PdfKit` / `iText` for payslip PDFs
- **Image/Assets:** Vector drawables for all icons

### 4.2 Module Structure

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/attendease/
│   │   │   ├── data/
│   │   │   │   ├── local/
│   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── daos/
│   │   │   │   │   └── converters/
│   │   │   │   ├── repository/
│   │   │   │   └── preferences/
│   │   │   ├── domain/
│   │   │   │   ├── model/
│   │   │   │   └── usecase/
│   │   │   ├── ui/
│   │   │   │   ├── theme/
│   │   │   │   │   ├── Color.kt
│   │   │   │   │   ├── Theme.kt
│   │   │   │   │   └── Type.kt
│   │   │   │   ├── components/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── employee/
│   │   │   │   │   └── admin/
│   │   │   │   └── navigation/
│   │   │   └── util/
│   │   └── res/
│   │       ├── values/
│   │       │   ├── colors.xml
│   │       │   ├── dimens.xml
│   │       │   └── strings.xml
│   │       ├── drawable/
│   │       ├── font/ (Plus Jakarta Sans, Inter)
│   │       └── xml/
│   └── build.gradle.kts
├── build.gradle.kts
└── settings.gradle.kts
```

---

## 5. Screen-by-Screen Requirements

### 5.1 Authentication Screens

**Login Screen:**
- Centered auth card with app logo (vector drawable)
- Email input with icon
- Password input with visibility toggle (eye icon)
- Sign In button (primary gradient)
- "Don't have an account? Register here" link
- Quick Demo Sign In buttons (Admin / Employee)
- Flash notifications (Snackbar)

**Register Screen:**
- Wider auth card
- First Name / Last Name (row)
- Email input
- Password input (min 6 chars, toggle visibility)
- Department dropdown (Engineering, Marketing, HR, Finance, Operations, Sales)
- Position input
- Create Account button

**Theme:** Dark indigo gradient background (`#1e1b4b` → `#0f172a`) with radial gradient glows.

---

### 5.2 Main Layout

**Sidebar (Navigation Drawer):**
- Fixed width: `260dp`
- Background: `linear-gradient(180deg, #0f172a, #1e1b4b 60%, #111827)`
- Brand header: Logo icon + "AttendEase" + "PRO DASHBOARD" tag
- Navigation sections with icons
- Footer: Avatar, user name, role, Sign Out button
- Slide-in animation on hamburger click
- Overlay with blur on open

**Topbar:**
- Height: `70dp`
- Background: `rgba(255,255,255,0.85)` with `blur(12px)`
- Hamburger menu (hidden on desktop/tablet, shown on mobile)
- Title text
- Date badge with calendar icon + live date/time + monospace clock

**Main Content:**
- Padding: `32dp` (desktop), `20dp` (mobile)
- Max width: `1440dp` centered
- Flash message container at top

---

### 5.3 Employee Dashboard

**Check-in Card (Hero):**
- Background: Indigo gradient (`#1e1b4b` → `#312e81` → `#4338ca`)
- Status dot with pulse animation (green for checked in, yellow for ready, purple for done)
- Status text + subtitle
- Check In / Check Out / Day Complete button
- Time display strip (Check In, Check Out, Status)

**Stats Grid:**
- 6 KPI cards in responsive grid (2 columns mobile, 3 tablet, 6 desktop)
- Icons in colored circles (blue, green, red, yellow, purple, indigo)
- Large stat values with tight letter spacing

**Quick Actions:**
- 2-column grid (Request Leave, Full History)
- Hover/tap effect: border color change, lift shadow

**Recent Attendance:**
- Card with table (last 10 records)
- Status badges with colored dots

---

### 5.4 Attendance History (Employee)

- Filter bar: Month dropdown, Year input, Apply/Clear buttons
- Paginated table (15 records/page)
- Columns: Date, Check In, Check Out, Hours, Status
- Status badges: Present (green), Late (yellow), Absent (red), Leave (blue)

---

### 5.5 Leave Requests (Employee)

- Header with "New Request" button
- Table: Type (colored chips), Start, End, Days, Reason, Status, Actions
- Leave type chips: Vacation (blue), Sick (green), Personal (purple), Other (yellow)
- New Request opens bottom sheet or dialog with form
- Cancel button for pending requests

---

### 5.6 Admin Dashboard

**KPI Cards Row:** Total Employees, Present Today, Absent Today, On Leave

**Pending Alert:** Yellow alert banner with link to Leave Management

**Two-Column Layout:**
- Left: Bar chart (last 7 working days, green = present, red = absent)
- Right: Today's Check-ins table

**Quick Nav Grid:** 4 cards (Manage Employees, Attendance Records, Leave Requests, Generate Reports)

---

### 5.7 Employee Management (Admin)

- Header with Add Employee button
- Filter bar: Search input, Department dropdown, Filter/Clear buttons
- Employee Card Grid:
  - Avatar (initials, gradient background)
  - Status dot (green = active, gray = inactive)
  - Name, position, department badge
  - Email, hire date
  - Footer: Edit, Activate/Deactivate, Delete buttons
- Inactive cards: reduced opacity + grayscale filter

**Add/Edit Employee Form:**
- Personal Info section: First/Last name, Email, Phone
- Work Info section: Department, Position, Hire Date
- Password section: Set/Change password (min 6 chars)
- Email is readonly on edit

---

### 5.8 Attendance Records (Admin)

- Filter bar: Employee dropdown, Start Date, End Date, Status dropdown, Apply/Clear
- Table: Employee (avatar + name + dept), Date, Check In, Check Out, Hours, Status, Edit button
- Edit Modal: datetime-local inputs for check-in/out, status dropdown
- Auto-calculate hours on save

---

### 5.9 Leave Management (Admin)

- Tab bar: Pending, Approved, Rejected, All Requests
- Table: Employee, Type (chip), Start, End, Days, Reason, Status, Review button
- Review Modal: Employee name, Admin note textarea, Approve/Reject/Cancel buttons

---

### 5.10 Analytics & Reports

- Header with month/year filter and Print button
- 4 KPI cards: Employees, Avg Attendance, Total Hours, Total Absences
- Employee breakdown table with progress bars (green ≥90%, yellow ≥75%, red <75%)
- Table footer with totals row
- Print support (Android Print Framework)

---

### 5.11 Run Monthly Payroll

- Header with "View Invoices Register" and "Edit Rules Policy" buttons
- Status bar: Engine status badge, effective date, version
- Two-column layout:
  - Left: Month/Year picker, operational check list, Run Payroll button
  - Right: Current period status (invoice count, total gross, total net), navigation button to invoices

---

### 5.12 Payroll Invoices & Register

- Header with Delete Batch, Run Payroll, Rules Policy buttons
- Filter bar: Month, Year, Status (All/Approved/Paid), Apply/Reset
- 4 KPI cards: Total Net Payout, Settled/Paid count, Overtime Paid, TDS Tax Withheld
- 12-column table: Invoice Ref, Employee & Dept, Base CTC, Attendance Days, Hours & OT, Basic & HRA, Allowances, Gross, Deductions, Net Pay, Status, Actions
- Actions column: Download PDF, View, Pay (or Paid badge)
- Table footer: Monthly totals
- Mark Paid Modal: Payment mode dropdown, Transaction ref input (auto-prefixed TXN...), Date picker
- Delete Batch Modal: Period name, 4-digit captcha display, captcha input, danger warning banner

---

### 5.13 Payroll Policy & Rules Console (7 Tabs)

**Tab 1 — Salary & Earnings Structure:**
- Basic % of Base CTC input
- HRA % of Basic input
- Conveyance Allowance (₹) input
- Medical Allowance (₹) input
- Earnings components registry table
- Save button

**Tab 2 — Deductions & Statutory Taxes:**
- PF enable toggle + rate input
- TDS enable toggle + rate input
- Health Insurance (₹) input
- Professional Tax mode (slab/flat) + slab table display

**Tab 3 — Attendance, LOP & Overtime:**
- Salary basis (working days / calendar days)
- Fixed working days input
- Late grace count input
- Late penalty type dropdown (half_day, quarter_day, flat, none)
- OT enable toggle
- Daily/Weekly thresholds + multiplier dropdown
- Formula callout boxes

**Tab 4 — Priority Cascade & Overrides:**
- 4-tier priority visual card
- Department baselines table with edit-in-place
- Add Department Scale button + modal

**Tab 5 — Category Profiles:**
- Category chip selector bar
- Category profile form (name, description, base CTC, component splits, OT config, statutory rates)
- Delete category button
- Employee mapping table (category, base CTC, dept baseline, effective base, bank details, PAN)

**Tab 6 — Test Simulation:**
- Active rules summary cards
- Employee selector dropdown
- Simulation banner ("DRAFT CALCULATED PAYROLL")
- Simulated payslip card with earnings/deductions breakdown

**Tab 7 — Payslip Branding:**
- Company legal name, address, GSTIN, email, signatory title, disclaimer
- Save button

---

### 5.14 Invoice View (Payslip)

**Toolbar:** Back button, Add Line Item (admin), Record Payment (admin), Print/Download PDF

**Invoice Card:**
- Company brand header (logo, name, address, GSTIN, email)
- Title block: "Official Tax Invoice & Salary Payslip", invoice number, status badge
- Employee & Disbursement meta grid (2 columns)
- Attendance Pill Bar (6 items: Working Days, Present, Paid Leaves, LOP, Total Logged, Overtime)
- Earnings vs Deductions split tables (side by side)
- Net Pay Banner: gradient background, amount in words (Lakhs/Crores), net amount
- Footer: Payment info + signatory seal

**Add Line Item Modal:** Type (earning/deduction), name, amount, recalculates totals

---

## 6. Payroll Calculation Reference (Kotlin Pseudocode)

```kotlin
fun calculatePayroll(userId: Int, month: Int, year: Int): PayrollResult {
    val user = userDao.getUser(userId) ?: return null
    val rules = payrollRuleDao.getActiveRules() ?: getDefaultRules()
    val salary = salaryDao.getSalary(userId) ?: defaultSalary(userId)
    val empType = rules.employeeTypes.find { it.id == salary.employeeTypeId } ?: defaultEmpType

    // Working days
    val workingDays = if (rules.globalRules.workingDaysMode == "fixed") {
        rules.globalRules.fixedWorkingDays
    } else {
        countWorkingDays(year, month)
    }

    // Attendance aggregation
    val userAtt = attendanceDao.getForUserMonth(userId, year, month)
    val presentDays = userAtt.count { it.status in listOf("present", "late") }
    val lateDays = userAtt.count { it.status == "late" }
    val totalHours = userAtt.sumOf { it.hoursWorked ?: 0.0 }

    // Overtime (dual threshold)
    val dailyThreshold = empType.dailyOvertimeThreshold
    val weeklyThreshold = empType.weeklyOvertimeThreshold
    val dailyOT = userAtt.filter { it.hoursWorked > dailyThreshold }
        .sumOf { it.hoursWorked - dailyThreshold }
    val weeklyOT = calculateWeeklyExcess(userAtt, weeklyThreshold)
    val totalOT = max(dailyOT, weeklyOT)

    // Effective base salary (higher-of logic)
    val individualBase = salary.baseSalary
    val categoryBase = empType.baseSalary
    val deptRule = rules.departmentRules.find { it.department.equals(user.department, ignoreCase = true) }
    val deptBase = deptRule?.minBaseSalary ?: 0
    val effectiveBase = maxOf(individualBase, categoryBase, deptBase)

    // Earnings
    val basic = (effectiveBase * empType.basicPercentage / 100).roundToInt()
    val hra = (basic * empType.hraPercentage / 100).roundToInt()
    val special = effectiveBase - (basic + hra + empType.conveyanceAllowance + empType.medicalAllowance)
    val hourlyRate = effectiveBase / (workingDays * 8)
    val otPay = (totalOT * hourlyRate * empType.overtimeMultiplier).roundToInt()
    val gross = basic + hra + special + empType.conveyanceAllowance + empType.medicalAllowance + otPay

    // Deductions
    val approvedLeaves = leaveDao.getApprovedForUserMonth(userId, year, month)
        .sumOf { it.daysRequested }
    val absentDays = max(0, workingDays - presentDays - approvedLeaves)
    val lop = ((effectiveBase / workingDays) * absentDays).roundToInt()

    val lateGrace = rules.attendanceLopConfig.lateGraceCount
    val lateDeduction = if (lateDays > lateGrace) {
        when (rules.attendanceLopConfig.latePenaltyType) {
            "half_day" -> ((effectiveBase / workingDays) * 0.5).roundToInt()
            "quarter_day" -> ((effectiveBase / workingDays) * 0.25).roundToInt()
            "flat" -> rules.attendanceLopConfig.lateFlatPenalty
            else -> 0
        }
    } else 0

    val pf = if (rules.deductionsConfig.pfEnabled) (basic * rules.deductionsConfig.pfRate / 100).roundToInt() else 0
    val tds = if (rules.deductionsConfig.tdsEnabled) (gross * rules.deductionsConfig.tdsRate / 100).roundToInt() else 0
    val pt = calculateProfessionalTax(gross, rules.deductionsConfig)
    val insurance = rules.deductionsConfig.healthInsurance

    val totalDeductions = lop + lateDeduction + pf + tds + insurance + pt
    val netPay = max(0, gross - totalDeductions)

    return PayrollResult(
        user = user,
        salary = salary,
        empType = empType,
        rules = rules,
        month = month, year = year,
        workingDays = workingDays,
        presentDays = presentDays,
        lateDays = lateDays,
        paidLeaves = approvedLeaves,
        absentDays = absentDays,
        totalHours = totalHours,
        overtimeHours = totalOT,
        standardHourlyRate = hourlyRate,
        otMultiplier = empType.overtimeMultiplier,
        baseSalary = effectiveBase,
        // ... all other fields
        netPay = netPay
    )
}
```

---

## 7. Data Seeding Strategy

On first launch (no users in DB), insert:

**Users:**
1. Admin User (`admin@company.com` / hash(`admin123`)) — Role: admin
2. Alice Johnson (`alice@company.com` / hash(`employee123`)) — Engineering, Senior Developer
3. Bob Smith (`bob@company.com` / hash(`employee123`)) — Engineering, Junior Developer
4. Carol Williams (`carol@company.com` / hash(`employee123`)) — Marketing, Marketing Manager
5. David Brown (`david@company.com` / hash(`employee123`)) — HR, HR Specialist
6. Eve Davis (`eve@company.com` / hash(`employee123`)) — Finance, Financial Analyst

**Attendance:** 30 days of random weekday records for each employee (present/late status, random check-in 08:00–10:00, hours 7.5–9.5)

**Leaves:** 5 sample records (approved, pending, rejected)

**Salaries:** Base salaries matching employee types

**Invoices:** Generate for July (paid) and August (approved) 2026

**Payroll Rules:** Default rules with all department baselines, employee types, overrides, company info

---

## 8. Navigation Flow

```
[Login] → (authenticated) → [Dashboard] or [Admin Dashboard]
    ↓
[Register] → [Login]
```

**Employee Bottom Nav / Drawer:**
- My Dashboard
- My Attendance History
- My Leave Requests
- My Payslips

**Admin Drawer:**
- Overview
- Employees
- Attendance Logs
- Leave Requests
- Analytics & Reports
- Run Monthly Payroll
- Payroll Invoices & Register
- Payroll Rules & Policy

---

## 9. Technical Constraints & Notes

1. **No Backend Required:** All data is local (Room DB). The app is fully functional offline.
2. **PDF Generation:** Use Android Print Framework (`PrintHelper`) or a lightweight PDF library. The print stylesheet from the web app should be adapted for A4 portrait output.
3. **Currency:** All amounts in INR (₹) with Lakhs/Crores number-to-words conversion.
4. **Animations:** Replicate CSS transitions/animations using Android's `updateTransition` / `animate*AsState` (Compose) or `ObjectAnimator` (XML).
5. **Pagination:** Implement in-memory pagination for attendance and invoice lists.
6. **Date/Time:** Use `java.time.LocalDate`, `LocalDateTime`, `LocalTime` with proper formatters.
7. **Password Hashing:** Replicate the simple hash function from the web app (or use a proper hashing algorithm like BCrypt for production readiness, but maintain backward compatibility with the seeded data).

---

## 10. Success Criteria

- [ ] All 17 screens/routes implemented and navigable
- [ ] All 6 default users can log in with correct credentials
- [ ] Check-in/out records timestamps and calculates hours correctly
- [ ] Leave request CRUD works with proper status transitions
- [ ] Payroll engine produces identical results to web app for seed data
- [ ] Invoice PDF is printable and visually matches web app layout
- [ ] All color tokens, fonts, and spacing match the CSS design system
- [ ] Room database persists data across app restarts
- [ ] Seed data auto-populates on first launch
- [ ] Admin can manage employees, approve leaves, run payroll, and mark invoices paid
- [ ] Batch delete with captcha works correctly
- [ ] Priority cascade payroll logic is mathematically identical
- [ ] Professional tax slab rules apply correctly
- [ ] Overtime dual-threshold (daily + weekly) calculates correctly

---

## 11. Out of Scope (v1.0)

- Multi-language / i18n support
- Biometric authentication
- Cloud sync / multi-device sync
- Push notifications
- Advanced reporting charts (beyond the bar chart in admin dashboard)
- Employee self-service password reset
- Audit logs

---

*End of PRD*