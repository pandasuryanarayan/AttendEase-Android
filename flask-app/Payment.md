# AttendEase — Payment & Payroll Invoice Generation System Specification

> **Status:** Implementation Complete  
> **Currency Format:** INR (`₹` / Indian Rupee) with Lakhs/Crores formatting  
> **Engine Version:** v2.4.0  
> **Target Module:** `html-app` (`html-app/js/app.js`, `html-app/css/style.css`, `html-app/index.html`)  

---

## 1. Executive Summary & Architecture

The **Payment & Payroll Invoice Generation System** transforms AttendEase into a complete **Time-to-Pay Automation Suite**. By directly consuming verified check-in/out timestamps, hours worked, late arrival flags, and approved leave records, the system calculates exact employee compensation, evaluates statutory deductions and priority policy overrides, generates itemized tax-compliant payslips/invoices in **Indian Rupees (INR / ₹)**, and provides one-click PDF generation, batch deletion with security captchas, and disburse management.

```
┌─────────────────────────┐     ┌───────────────────────────┐     ┌────────────────────────────┐
│   Attendance & Leaves   │ ──> │ 4-Tier Cascade Payroll    │ ──> │   Payslip / Tax Register   │
│  (Hours, Days, Leaves)  │     │ Engine (INR ₹, OT, LOP)   │     │ (A4 PDF, Captcha, Status)  │
└─────────────────────────┘     └───────────────────────────┘     └────────────────────────────┘
```

---

## 2. Core Business & Engine Logic

### 2.1 Priority Cascade Engine & Higher Base Pay Baseline

Payroll calculation follows a **4-Level Priority Cascade**:
1. **Level 1 — Employee Override**: Individual employee contract overrides (highest priority).
2. **Level 2 — Position Exception**: Specific job title / designation exceptions.
3. **Level 3 — Department Baseline Scale**: Department minimum salary floor.
4. **Level 4 — Company Default Scale**: Default company baseline rules.

#### Higher Engine Base CTC Formula:
To ensure no employee receives less than their department or category baseline:
$$\text{Effective Base CTC} = \max(\text{Individual Base CTC}, \text{Category Base CTC}, \text{Department Minimum Baseline})$$

| Department | Min Baseline CTC (₹) | HRA Override Tier | Description |
| :--- | :--- | :--- | :--- |
| **Management** | ₹1,50,000 | 50% | Executive Leadership, Admin & Directors |
| **Engineering** | ₹95,000 | 45% | Software Engineering, Architecture & DevOps |
| **Finance** | ₹75,000 | 40% (Company default) | Financial Planning, Accounting & Audit |
| **Sales** | ₹70,000 | 40% (Company default) | Direct Sales, Accounts & BD |
| **Marketing** | ₹65,000 | 40% (Company default) | Brand Marketing & Communications |
| **HR** | ₹60,000 | 40% (Company default) | Talent Acquisition & People Operations |
| **Operations** | ₹55,000 | 40% (Company default) | Logistics, Workplace & Operations |

---

### 2.2 Salary Structure & Statutory Tax Deductions

Component breakdown calculated on **Effective Base CTC**:

1. **Basic Salary**: $50\%$ of Effective Base CTC.
2. **House Rent Allowance (HRA)**: $40\%$ of Basic (or $45\%/50\%$ if department override applies).
3. **Conveyance Allowance**: Fixed ₹2,000 / month.
4. **Medical Allowance**: Fixed ₹1,500 / month.
5. **Special / Flexi Allowance**: Residual amount to match Gross Base:
   $$\text{Special Allowance} = \text{Effective Base CTC} - (\text{Basic} + \text{HRA} + \text{Conveyance} + \text{Medical})$$

#### Statutory Deductions:
- **Provident Fund (PF / EPF)**: $6.0\%$ of Basic Salary (Toggleable inline).
- **Income Tax (TDS)**: $10.0\%$ of Gross Earnings (Toggleable inline).
- **Professional Tax (PT)**: Slab-based state tax:
  - Gross $\le ₹7,500 \rightarrow ₹0$
  - $₹7,501 - ₹10,000 \rightarrow ₹175$
  - Gross $> ₹10,000 \rightarrow ₹200$
- **Health Insurance**: Fixed ₹500 / month.

---

### 2.3 Attendance LOP & Overtime Calculations

#### Loss of Pay (LOP) & Late Penalty:
- **Fixed Working Days Basis**: 22 Days standard month basis.
- **LOP Rate**: $\text{Daily Rate} = \frac{\text{Effective Base CTC}}{\text{Working Days}}$
- **Late Arrivals**: 2 free grace passes per month. 3rd+ late arrival incurs half-day penalty ($0.5 \times \text{Daily Rate}$).

#### Dual-Threshold Overtime ($1.5\times$ Multiplier):
- **Daily Threshold**: Logged hours $> 8.0\text{ hrs/day}$.
- **Weekly Threshold**: Logged hours $> 40.0\text{ hrs/week}$.
- **Hourly Rate**: $\text{Standard Rate} = \frac{\text{Effective Base CTC}}{\text{Working Days} \times 8}$
- **OT Pay**: $\text{Total OT Hours} \times (\text{Standard Rate} \times 1.5)$

---

### 2.4 Final Net Payable Formula

$$\text{Gross Earnings} = \text{Basic} + \text{HRA} + \text{Special Allowance} + \text{Conveyance} + \text{Medical} + \text{Overtime Pay} + \text{Bonus}$$

$$\text{Total Deductions} = \text{LOP Deduction} + \text{Late Deduction} + \text{PF} + \text{TDS Tax} + \text{PT} + \text{Insurance}$$

$$\mathbf{\text{Net Payable (₹)}} = \mathbf{\text{Gross Earnings}} - \mathbf{\text{Total Deductions}}$$

---

## 3. Separated Tab Navigation Architecture

The system is structured into three dedicated tabs for clarity:

1. **`⚡ Run Monthly Payroll` (`#payroll`)**:
   - Target month and year picker with payroll simulation dry-run.
   - Execution button: `⚡ Run Monthly Payroll & Generate Invoices`.
   - Animated transition button: `Go to Invoices Register & Download Payslips →`.

2. **`📄 Payroll Invoices & Register` (`#invoices`)**:
   - Tabular register displaying complete details per employee:
     - Employee Name, Code & Dept
     - Base CTC & Applied Dept Baseline
     - Working/Present/Late Days & Overtime Hours
     - Basic Pay, HRA, Allowances, Gross Earnings
     - Statutory Deductions (PF, TDS, PT, LOP)
     - Net Payable (₹)
     - Status Badge (`PAID` / `APPROVED` / `PENDING`)
     - Actions: High-visibility `📥 Download PDF`, `👁️ View`, `💵 Pay`.
   - **Header KPI Cards with Vector SVG Icons**: Net Payout (`₹`), Settled Invoices badge, Overtime Clock, TDS Shield.
   - **Permanent Batch Delete with Captcha (`openDeleteBatchModal`)**: 4-digit security code challenge modal to permanently delete monthly batches without accidental data loss.

3. **`⚙️ Payroll Policy & Rules Console` (`#payroll-settings`)**:
   - Component percentage sliders & statutory tax toggles.
   - Employee Category Kit Profiles & Mapping table (`#employee-mapping-form`).
   - Priority Overrides manager & dry-run test simulator.
   - Animated navigation return button: `← Back to Payment Processing`.

---

## 4. UI/UX & Component Styling Specifications

- **Animated Navigation Arrow Buttons**: `.btn-animated-next` and `.btn-animated-back` with smooth CSS pulse/slide keyframe animations.
- **High-Visibility PDF Button**: `.btn-download-pdf` styled in solid emerald green (`#059669`) with vector SVG download tray.
- **Animated Lifting Lid Delete Button**: `.btn-animated-danger` with SVG trash can whose lid rotates up (`-22deg`) on hover.
- **Fixed Action Column Layout**: `.actions-cell-group` and `.action-slot-pay` fixed width container ($76\text{px}$) to prevent horizontal button shifting when an invoice is marked paid.
- **Badge Dot Normalization**: `.badge-no-dot` class ensures `✓ PAID` displays only the checkmark without double-dot artifacts.
- **Premium Modal Design**: `#mark-paid-modal` and `#delete-batch-modal` feature header icon badges, informational warning banners, and styled monospace inputs.

---

## 5. File Location & File History

- **Current Production File**: `html-app/Payment.md`
- **Application Implementation**: `html-app/js/app.js`, `html-app/css/style.css`, `html-app/index.html`
