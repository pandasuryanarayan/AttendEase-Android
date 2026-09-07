# AttendEase — Employee Attendance System Suite

AttendEase is a comprehensive Employee Attendance Management & Salary Payroll Suite implemented in **four distinct architectures** — Flask, Vanilla JS, React 19, and a native Android app — all sharing a unified design system, feature surface, and demo data model.

Every implementation ships the same **Payroll & Salary Payment Engine**: salary structures, statutory deductions (PF/TDS/PT), LOP & overtime, 4-tier priority cascade, 7-tab policy console, payroll run console, salary register, and printable A4 tax invoices.

> **Design parity is 100% by construction** — the Android app literally bundles the `html-app` SPA verbatim in `app/src/main/assets/`, so every screen, color token, animation, filter, modal, payroll rule, and invoice renders pixel-identically on Android.

---

## 📂 Project Implementations Overview

```text
AttendEase-Employee-Attendance-System-Suite/
├── 🐍 flask-app/      # Server-Side Rendered app (Python, Flask, SQLAlchemy, SQLite)
├── 🌐 html-app/       # Client-Side Single Page Application (Vanilla HTML/CSS/JS, localStorage)
├── ⚛️ react-app/      # Modern Component-Driven SPA (React 19, Vite, Context API)
└── 🤖 android-app/    # Native Android (Kotlin + WebView) packaging the exact html-app SPA
```

All three web implementations share a unified **Design System** — `Plus Jakarta Sans` typography, HSL color tokens, dark indigo sidebar, vector SVG icon set, and standardized responsive layouts.

---

## ⚡ Technical Comparison Matrix

| Aspect / Feature | 🐍 `flask-app` | 🌐 `html-app` | ⚛️ `react-app` | 🤖 `android-app` |
| :--- | :--- | :--- | :--- | :--- |
| **Architecture** | Server-Side Rendered (SSR) | Client-Side SPA | Component-Driven SPA | Native Android shell + embedded `html-app` SPA |
| **Language / Engine** | Python 3 / Jinja2 | JavaScript (ES6+) | React 19 (JSX) | Kotlin + WebView (Chromium) |
| **Build Tooling** | None (Flask Dev Server) | None (Browser Native) | Vite | Gradle 8.9 + Android Gradle Plugin |
| **Persistence Layer** | SQLite Database (`attendance.db`) | Browser `localStorage` | Browser `localStorage` | WebView `localStorage` (DOM storage) |
| **State / Session** | Flask Server Sessions | JS Storage Module | React Context API (`AppContext`) | SPA JS Storage Module |
| **Routing** | Flask Server Routes (`@app.route`) | Hash Router (`window.location.hash`) | Component State Views | Hash Router inside WebView (+ hardware back) |
| **Default Port** | `http://localhost:5000` | `http://localhost:8000` | `http://localhost:5173` | N/A (installable APK, runs offline) |
| **Payroll Engine** | `payroll_engine.py` (Python) | `app.js` (JS) | `utils/payroll.js` (JS) | Inherited from bundled `html-app` |

---

## ✨ Unified Features Across All Implementations

### 👤 Employee Portal
- **Live Dashboard** — shift status banner, 1-click Check-In / Check-Out with automatic *Present* vs *Late* detection, working-hours counter, recent activity log.
- **Attendance History** — personal monthly records filterable by month and year.
- **Leave Requests** — submit time-off (*Vacation*, *Sick Leave*, *Personal*, *Other*) and track approval status.
- **My Payslips & Tax Invoices** — YTD gross earnings, net salary received, overtime hours, TDS tax paid, and printable A4 invoice documents.

### 🛡️ Admin Portal
- **Live KPI Dashboard** — Present, Late, Absent, and On-Leave counts.
- **Employee Management** — create, edit, activate/deactivate, delete accounts (standardized 3-column action card layout).
- **Attendance Management** — multi-criteria filters (*Employee*, *Date Range*, *Status*, *Month/Year*) with modal record editor.
- **Leave Approval Workflow** — approve/reject with optional reviewer notes.
- **Analytics & Reports** — monthly breakdown, printable A4 reports (`window.print()`), KPI summary cards, and `<tfoot>` totals.

### 💰 Payroll & Salary Payment Engine
- **Run Monthly Payroll Console** — operational checks, engine status indicators, month/year selection.
- **Payroll Invoices & Register** — 12-column salary register, month/year/status filters, 4 KPI summary cards (*Total Net Payout*, *Settled/Paid*, *Overtime Paid*, *TDS Tax Withheld*), `<tfoot>` totals row, **Mark Paid Modal** (auto-prefilled `TXN…` reference IDs), **Delete Batch Modal** (4-digit security captcha).
- **Payroll Policy & Rules Console (7 Tabs)**:
  1. `💵 1. Salary & Earnings Structure` — Basic %, HRA %, Conveyance, Medical, Special Allowance residual formula.
  2. `🛡️ 2. Deductions & Statutory Taxes` — PF %, TDS %, Group Health Insurance, Professional Tax (PT) slabs.
  3. `⏱️ 3. Attendance, LOP & Overtime` — LOP formula, late-arrival grace, late penalties, dual-threshold Overtime engine (>8h/day, >40h/week, 1.5×).
  4. `🔀 4. Priority Cascade & Overrides` — 4-tier cascade (Employee > Position > Department Baseline > Universal Defaults) + department minimum base scales.
  5. `👔 5. Category Profiles` — category chips, component splits, employee category & salary mapping.
  6. `🧪 6. Test Simulation & Preview` — interactive dry-run simulator for draft calculations.
  7. `🏢 7. Payslip Branding & Entity` — legal entity, corporate address, GSTIN, contact, signatory title, disclaimer.
- **Printable A4 Tax Invoice & Salary Certificate** — company branding, employee meta grid, 6-metric attendance pill bar, side-by-side earnings vs deductions, number-to-words banner (Lakhs/Crores), signatory seal, custom line-item modal.

### 🎨 Standardized UI & Sizing
- **Typography**: `Plus Jakarta Sans` across buttons, nav, cards, inputs.
- **Vector SVG Icon Suite**: zero-dependency, shared across all web apps.
- **Attendance Log Filters**: consistent field ordering (*Employee/Month-Year*, *From Date*, *To Date*, *Status* last) with `Apply` / `Clear`.
- **Employee Action Cards**: equal 3-column flex layout (*Edit*, *Deactivate/Activate*, *Delete*).

---

## 🔑 Default Demo Credentials

All four applications auto-seed the same demo accounts on first run:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `alice@company.com` | `employee123` |
| **Employee** | `bob@company.com` | `employee123` |
| **Employee** | `carol@company.com` | `employee123` |

> The `flask-app` additionally seeds the same `alice@`/`bob@`/`carol@` accounts (and a few more) into SQLite. The `html-app`, `react-app`, and `android-app` all share the identical JS seed payload.

---

## 🚀 How to Run Each Project

### 1. 🐍 Flask Application (`flask-app`)

Requires **Python 3.8+**.

```bash
cd flask-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate          # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt   # or: pip install flask flask-sqlalchemy werkzeug

# Start Flask dev server
python3 app.py
```

> Open **`http://localhost:5000`** in your browser. The SQLite database (`attendance.db`) auto-seeds on first run.

---

### 2. 🌐 Vanilla HTML/CSS/JS Application (`html-app`)

No dependencies, no build tools.

```bash
cd html-app

# Option A: local HTTP server (recommended)
python3 -m http.server 8000

# Option B: just open index.html in any browser
```

> Open **`http://localhost:8000`** in your browser. Demo data is auto-seeded into `localStorage` on first load.

---

### 3. ⚛️ React 19 Application (`react-app`)

Requires **Node.js 18+**.

```bash
cd react-app

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

> Open **`http://localhost:5173`** in your browser. Demo data is auto-seeded into `localStorage` on first load.

---

### 4. 🤖 Native Android Application (`android-app`)

The Android app bundles the `html-app` SPA verbatim — no separate build step is needed for the SPA itself. You only build the Android shell.

**Prerequisites**

- **Android Studio** (Ladybug or newer) with Android SDK 35, **or**
- Command line: **JDK 17** + Android SDK with `ANDROID_HOME` set.

**Option A — Android Studio (recommended)**

1. **File ▸ Open** → select the `android-app/` folder.
2. Let Gradle sync finish (Gradle 8.9 downloads automatically).
3. Press **Run ▶** on any device/emulator running **Android 8.0 (API 26)+**.

**Option B — Command line**

```bash
cd android-app

# First time only — generate the Gradle wrapper (requires any local Gradle ≥ 8.x):
gradle wrapper --gradle-version 8.9

# Build a debug APK
./gradlew assembleDebug

# Install on a connected device
./gradlew installDebug
# APK output: app/build/outputs/apk/debug/app-debug.apk
```

**Option C — Release**

```bash
./gradlew assembleRelease   # unsigned; sign with your keystore before publishing
```

| Build config | Value |
| :--- | :--- |
| `applicationId` | `com.attendease.android` |
| `minSdk` | 24 (Android 7.0) |
| `targetSdk` / `compileSdk` | 35 (Android 15) |
| Gradle / AGP / Kotlin | 8.9 / 8.7.x / 2.0.x |

**Android-specific features**

- Branded cold-start splash (indigo → violet gradient, calendar glyph).
- Adaptive launcher icon (monochrome themed-icon support on Android 13+).
- Status / navigation bars blended to the SPA topbar.
- Hardware back button / gesture nav walks SPA hash history.
- **Native print bridge** (`PrintBridge.kt`) — `window.print()` calls route through Android's system print dialog, with **Save as PDF** support honoring the app's `@media print` A4 stylesheet.
- WebView `localStorage` persists users, attendance, leaves, salaries, invoices, payroll rules, and the session across restarts.
- Rotation / multitasking safe (`configChanges` + WebView state save/restore).
- Works fully offline (only the `Plus Jakarta Sans` / `Inter` Google Fonts hit the network; system Roboto fallback).

---

## 📁 Repository Structure

```text
AttendEase-Employee-Attendance-System-Suite/
├── README.md                 # ← you are here
├── .gitignore                # Flask venv/Python, React node_modules/dist
├── flask-app/
│   ├── app.py                # Routes, business logic, payroll run console
│   ├── models.py             # SQLAlchemy models
│   ├── payroll_engine.py     # calculate_payroll(), format_inr(), number_to_words_inr()
│   ├── requirements.txt
│   ├── templates/            # Jinja2 templates
│   ├── static/               # CSS, JS, icons
│   ├── README.md
│   └── Payment.md            # Payroll architecture docs
├── html-app/
│   ├── index.html            # SPA shell
│   ├── css/
│   ├── js/app.js             # Router, state, seed, payroll engine, views
│   ├── favicon.svg
│   ├── README.md
│   └── Payment.md
├── react-app/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── context/          # AppContext (state, payroll rules, invoices)
│   │   ├── components/       # Icons.jsx + shared UI
│   │   ├── pages/            # Dashboard, Employees, Attendance, Leaves, Reports, Payroll*, InvoiceView
│   │   ├── data/             # Seed data
│   │   ├── utils/            # payroll.js + helpers
│   │   ├── assets/
│   │   ├── App.css
│   │   └── index.css
│   ├── README.md
│   └── Payment.md
└── android-app/
    ├── settings.gradle.kts
    ├── build.gradle.kts
    ├── gradle.properties
    ├── gradlew / gradlew.bat
    ├── gradle/wrapper/
    └── app/
        ├── build.gradle.kts
        ├── proguard-rules.pro
        └── src/main/
            ├── AndroidManifest.xml
            ├── assets/       # ← the EXACT html-app, bundled verbatim
            ├── java/com/attendease/android/
            │   ├── MainActivity.kt
            │   └── PrintBridge.kt
            └── res/          # colors, themes, drawables, mipmaps, xml
```

---

## 📄 Per-Project Documentation

- 📖 [Flask App](flask-app/README.md) · [Payment Architecture](flask-app/Payment.md)
- 📖 [HTML/CSS/JS SPA](html-app/README.md) · [Payment Architecture](html-app/Payment.md)
- 📖 [React App](react-app/README.md) · [Payment Architecture](react-app/Payment.md)
- 📖 [Android App](android-app/README.md)

---

## 🤝 Contributing

1. Fork the repo & create a feature branch.
2. Make your changes — please keep the unified **Design System** and the **Payroll Engine parity** in mind across all four implementations.
3. If you change anything in `html-app/`, mirror it inside `android-app/app/src/main/assets/` (and vice-versa) to preserve Android parity.
4. Open a pull request.

---

## 📜 License

This project is provided as-is for educational and demonstration purposes. See individual sub-project READMEs for any additional notes.
