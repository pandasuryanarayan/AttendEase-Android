# payroll_engine.py
"""
Payroll Calculation Engine for Flask App
Mirrors the html-app payroll engine exactly (calculatePayroll, formatINR, numberToWordsINR)
"""
import math
import json
from datetime import date, timedelta


def get_default_payroll_rules():
    """Default payroll policy rules — identical to html-app getDefaultPayrollRules()."""
    return {
        'rule_status': 'ACTIVE',
        'version': '2.4.0',
        'effective_from': '01-Aug-2026',
        'basic_pct': 50,
        'hra_pct': 40,
        'conveyance': 2000,
        'medical': 1500,
        'pf_pct': 6,
        'tds_pct': 10,
        'insurance': 500,
        'professional_tax_slab': [
            {'min': 0, 'max': 15000, 'tax': 0},
            {'min': 15001, 'max': 25000, 'tax': 175},
            {'min': 25001, 'max': 999999999, 'tax': 200}
        ],
        'ot_multiplier': 1.5,
        'daily_hours_threshold': 8.0,
        'weekly_hours_threshold': 40.0,
        'late_free_passes': 2,
        'late_penalty_type': 'half_day',
        'lop_per_day_pct': 100,
        'hra_metro_pct': 50,
        'hra_non_metro_pct': 40,
        'hra_tier2_pct': 45,

        # Department baselines
        'department_baselines': {},
        # Category profiles
        'categories': {
            'Standard': {'base_ctc': 50000, 'custom_earnings': [], 'custom_deductions': []},
        },
        # Company branding
        'company': {
            'company_name': 'AttendEase Technologies Pvt. Ltd.',
            'address': 'Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002',
            'gstin': '07AABCA1234F1Z8',
            'email': 'contact@attendease.com',
            'signatory_title': 'Finance & Payroll Department',
            'disclaimer': 'This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules.'
        }
    }


def get_default_salaries():
    """Default salary structures for seed employees."""
    return {
        'Engineering': 75000,
        'Marketing': 55000,
        'HR': 50000,
        'Finance': 65000,
        'Management': 90000,
    }


def format_inr(amount):
    """Format number as Indian Rupee string with commas (Lakhs/Crores system)."""
    if amount is None:
        amount = 0
    amount = round(amount, 2)
    negative = amount < 0
    amount = abs(amount)

    integer_part = int(amount)
    decimal_part = round((amount - integer_part) * 100)

    s = str(integer_part)
    if len(s) > 3:
        last3 = s[-3:]
        rest = s[:-3]
        # Group rest in pairs from right
        groups = []
        while rest:
            groups.append(rest[-2:])
            rest = rest[:-2]
        groups.reverse()
        formatted = ','.join(groups) + ',' + last3
    else:
        formatted = s

    result = f"₹{formatted}"
    if decimal_part > 0:
        result += f".{decimal_part:02d}"

    if negative:
        result = f"-{result}"
    return result


def number_to_words_inr(num):
    """Convert a number to Indian Rupee words (Crore, Lakh, Thousand system)."""
    if num is None or num == 0:
        return 'Zero Rupees Only'

    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    def two_digits(n):
        if n < 20:
            return ones[n]
        return (tens[n // 10] + ' ' + ones[n % 10]).strip()

    def three_digits(n):
        if n >= 100:
            return ones[n // 100] + ' Hundred ' + two_digits(n % 100)
        return two_digits(n)

    num = round(num, 2)
    rupees = int(num)
    paise = round((num - rupees) * 100)

    if rupees == 0 and paise == 0:
        return 'Zero Rupees Only'

    words = ''
    if rupees > 0:
        crore = rupees // 10000000
        remainder = rupees % 10000000
        lakh = remainder // 100000
        remainder = remainder % 100000
        thousand = remainder // 1000
        remainder = remainder % 1000

        if crore > 0:
            words += two_digits(crore) + ' Crore '
        if lakh > 0:
            words += two_digits(lakh) + ' Lakh '
        if thousand > 0:
            words += two_digits(thousand) + ' Thousand '
        if remainder > 0:
            words += three_digits(remainder)

        words = words.strip() + ' Rupees'

    if paise > 0:
        words += ' and ' + two_digits(paise) + ' Paise'

    return words.strip() + ' Only'


def calculate_payroll(user, attendance_records, rules, salary_info):
    """
    Calculate payroll for one employee for one month.
    Mirrors html-app calculatePayroll() exactly.
    """
    base_ctc = salary_info.get('base_ctc', 50000)
    category = salary_info.get('category', 'Standard')

    # Check category base CTC
    cat_data = rules.get('categories', {}).get(category, {})
    cat_base = cat_data.get('base_ctc', 0)

    # Check department baseline
    dept = getattr(user, 'department', '') or ''
    dept_baselines = rules.get('department_baselines', {})
    dept_base = dept_baselines.get(dept, 0)

    # Priority cascade: use highest of individual, category, department
    effective_base = max(base_ctc, cat_base, dept_base)
    applied_reason = ''
    if effective_base == dept_base and dept_base > base_ctc:
        applied_reason = f'Elevated by {dept} Baseline'
    elif effective_base == cat_base and cat_base > base_ctc:
        applied_reason = f'Category {category} Benchmark'

    # Attendance aggregation
    working_days = 0
    present_days = 0
    absent_days = 0
    late_days = 0
    total_hours = 0
    overtime_hours = 0

    daily_hours_threshold = rules.get('daily_hours_threshold', 8.0)
    weekly_hours_threshold = rules.get('weekly_hours_threshold', 40.0)

    for rec in attendance_records:
        if hasattr(rec, 'date'):
            d = rec.date
            if isinstance(d, date) and d.weekday() < 5:
                working_days += 1
        hours = rec.hours_worked or 0
        status = rec.status or 'absent'

        if status in ('present', 'late'):
            present_days += 1
            total_hours += hours
            if status == 'late':
                late_days += 1
            # Daily overtime
            if hours > daily_hours_threshold:
                overtime_hours += hours - daily_hours_threshold

    absent_days = max(0, working_days - present_days)
    total_hours = round(total_hours, 1)
    overtime_hours = round(overtime_hours, 1)

    # Salary component calculation
    basic_pct = rules.get('basic_pct', 50)
    hra_pct = rules.get('hra_pct', 40)
    conveyance = rules.get('conveyance', 2000)
    medical = rules.get('medical', 1500)

    basic_pay = round(effective_base * basic_pct / 100)
    hra = round(effective_base * hra_pct / 100)
    conveyance_allowance = conveyance
    medical_allowance = medical
    special_allowance = max(0, effective_base - basic_pay - hra - conveyance_allowance - medical_allowance)

    # Overtime pay
    ot_multiplier = rules.get('ot_multiplier', 1.5)
    standard_hourly_rate = round(effective_base / (working_days * daily_hours_threshold)) if working_days > 0 else 200
    overtime_pay = round(overtime_hours * standard_hourly_rate * ot_multiplier)

    # Category custom earnings
    type_custom_earnings = cat_data.get('custom_earnings', [])
    custom_earnings_total = sum(item.get('amount', 0) for item in type_custom_earnings)

    gross_earnings = basic_pay + hra + special_allowance + conveyance_allowance + medical_allowance + overtime_pay + custom_earnings_total

    # Deductions
    # LOP deduction
    per_day = round(effective_base / (working_days if working_days > 0 else 22))
    lop_deduction = absent_days * per_day

    # Late penalty
    late_free = rules.get('late_free_passes', 2)
    late_deduction = 0
    if late_days > late_free:
        penalty_days = late_days - late_free
        late_deduction = round(penalty_days * per_day * 0.5)

    # PF
    pf_pct = rules.get('pf_pct', 6)
    pf_deduction = round(basic_pay * pf_pct / 100)

    # TDS
    tds_pct = rules.get('tds_pct', 10)
    tds_tax = round(gross_earnings * tds_pct / 100)

    # Professional Tax
    professional_tax = 0
    pt_slabs = rules.get('professional_tax_slab', [])
    for slab in pt_slabs:
        if effective_base >= slab.get('min', 0) and effective_base <= slab.get('max', 999999999):
            professional_tax = slab.get('tax', 0)
            break

    # Insurance
    insurance = rules.get('insurance', 500)

    # Category custom deductions
    type_custom_deductions = cat_data.get('custom_deductions', [])
    custom_deductions_total = sum(item.get('amount', 0) for item in type_custom_deductions)

    total_deductions = lop_deduction + late_deduction + pf_deduction + tds_tax + professional_tax + insurance + custom_deductions_total

    net_pay = gross_earnings - total_deductions

    return {
        'base_salary': effective_base,
        'applied_salary_reason': applied_reason,
        'basic_pay': basic_pay,
        'hra': hra,
        'special_allowance': special_allowance,
        'conveyance_allowance': conveyance_allowance,
        'medical_allowance': medical_allowance,
        'overtime_pay': overtime_pay,
        'bonus': 0,
        'gross_earnings': gross_earnings,

        'working_days': working_days,
        'present_days': present_days,
        'absent_days': absent_days,
        'late_days': late_days,
        'paid_leaves': 0,
        'total_hours': total_hours,
        'overtime_hours': overtime_hours,

        'lop_deduction': lop_deduction,
        'late_deduction': late_deduction,
        'pf_deduction': pf_deduction,
        'tds_tax': tds_tax,
        'professional_tax': professional_tax,
        'insurance': insurance,
        'total_deductions': total_deductions,

        'net_pay': net_pay,

        'ot_multiplier': ot_multiplier,
        'standard_hourly_rate': standard_hourly_rate,
    }
