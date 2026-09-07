# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='employee', nullable=False)  # 'employee' | 'admin'
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    hire_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    attendance_records = db.relationship('Attendance', backref='employee', lazy='dynamic',
                                         cascade='all, delete-orphan')
    leave_requests = db.relationship('LeaveRequest', backref='employee', lazy='dynamic',
                                     cascade='all, delete-orphan')
    salary = db.relationship('Salary', backref='employee', uselist=False,
                             cascade='all, delete-orphan')
    invoices = db.relationship('PayrollInvoice', backref='employee', lazy='dynamic',
                               cascade='all, delete-orphan')

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    def __repr__(self):
        return f'<User {self.email}>'


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    hours_worked = db.Column(db.Float)
    status = db.Column(db.String(20), default='present')  # present | late | absent | leave
    notes = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='uq_user_date'),
    )

    @property
    def check_in_str(self):
        return self.check_in.strftime('%I:%M %p') if self.check_in else '—'

    @property
    def check_out_str(self):
        return self.check_out.strftime('%I:%M %p') if self.check_out else '—'

    @property
    def status_badge(self):
        badges = {
            'present': 'badge-success',
            'late': 'badge-warning',
            'absent': 'badge-danger',
            'leave': 'badge-info'
        }
        return badges.get(self.status, 'badge-secondary')

    def __repr__(self):
        return f'<Attendance user={self.user_id} date={self.date}>'


class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    leave_type = db.Column(db.String(50), nullable=False)  # vacation | sick | personal | other
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    days_requested = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending | approved | rejected
    admin_note = db.Column(db.Text)
    reviewed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.now)

    @property
    def status_badge(self):
        badges = {
            'pending': 'badge-warning',
            'approved': 'badge-success',
            'rejected': 'badge-danger'
        }
        return badges.get(self.status, 'badge-secondary')

    def __repr__(self):
        return f'<LeaveRequest user={self.user_id} {self.start_date}–{self.end_date}>'


class Salary(db.Model):
    __tablename__ = 'salaries'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    base_ctc = db.Column(db.Float, default=50000.0)
    bank_name = db.Column(db.String(100), default='HDFC Bank Ltd.')
    bank_account_no = db.Column(db.String(50), default='••••••••4892')
    bank_ifsc = db.Column(db.String(20), default='HDFC0001001')
    pan_no = db.Column(db.String(20), default='ABCDE1234F')
    category = db.Column(db.String(50), default='Standard')
    created_at = db.Column(db.DateTime, default=datetime.now)

    def __repr__(self):
        return f'<Salary user={self.user_id} ctc={self.base_ctc}>'


class PayrollRules(db.Model):
    __tablename__ = 'payroll_rules'

    id = db.Column(db.Integer, primary_key=True)
    rules_json = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def get_rules(self):
        return json.loads(self.rules_json)

    def set_rules(self, rules_dict):
        self.rules_json = json.dumps(rules_dict)

    def __repr__(self):
        return f'<PayrollRules id={self.id}>'


class PayrollInvoice(db.Model):
    __tablename__ = 'payroll_invoices'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    invoice_number = db.Column(db.String(50), nullable=False, unique=True)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)

    # Salary components
    base_salary = db.Column(db.Float, default=0)
    applied_salary_reason = db.Column(db.String(200))
    basic_pay = db.Column(db.Float, default=0)
    hra = db.Column(db.Float, default=0)
    special_allowance = db.Column(db.Float, default=0)
    conveyance_allowance = db.Column(db.Float, default=0)
    medical_allowance = db.Column(db.Float, default=0)
    overtime_pay = db.Column(db.Float, default=0)
    bonus = db.Column(db.Float, default=0)
    gross_earnings = db.Column(db.Float, default=0)

    # Attendance data
    working_days = db.Column(db.Integer, default=0)
    present_days = db.Column(db.Integer, default=0)
    absent_days = db.Column(db.Integer, default=0)
    late_days = db.Column(db.Integer, default=0)
    paid_leaves = db.Column(db.Integer, default=0)
    total_hours = db.Column(db.Float, default=0)
    overtime_hours = db.Column(db.Float, default=0)

    # Deductions
    lop_deduction = db.Column(db.Float, default=0)
    late_deduction = db.Column(db.Float, default=0)
    pf_deduction = db.Column(db.Float, default=0)
    tds_tax = db.Column(db.Float, default=0)
    professional_tax = db.Column(db.Float, default=0)
    insurance = db.Column(db.Float, default=500)
    total_deductions = db.Column(db.Float, default=0)

    # Net
    net_pay = db.Column(db.Float, default=0)

    # Payment status
    status = db.Column(db.String(20), default='approved')  # approved | paid
    payment_mode = db.Column(db.String(100))
    transaction_ref = db.Column(db.String(100))
    paid_at = db.Column(db.String(50))

    # Engine metadata
    ot_multiplier = db.Column(db.Float, default=1.5)
    standard_hourly_rate = db.Column(db.Float, default=200)

    # Custom line items (JSON)
    custom_line_items_json = db.Column(db.Text, default='[]')

    created_at = db.Column(db.DateTime, default=datetime.now)

    __table_args__ = (
        db.Index('ix_invoice_month_year', 'month', 'year'),
    )

    @property
    def custom_line_items(self):
        try:
            return json.loads(self.custom_line_items_json or '[]')
        except (json.JSONDecodeError, TypeError):
            return []

    @custom_line_items.setter
    def custom_line_items(self, items):
        self.custom_line_items_json = json.dumps(items)

    @property
    def status_badge(self):
        if self.status == 'paid':
            return 'badge-success badge-no-dot'
        return 'badge-info'

    @property
    def status_text(self):
        return '✓ PAID' if self.status == 'paid' else self.status.upper()

    def __repr__(self):
        return f'<PayrollInvoice {self.invoice_number}>'
