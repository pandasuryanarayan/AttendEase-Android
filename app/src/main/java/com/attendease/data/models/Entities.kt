package com.attendease.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class User(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val firstName: String,
    val lastName: String,
    val email: String,
    val passwordHash: String,
    val role: String, // "admin" or "employee"
    val department: String,
    val position: String,
    val phone: String = "",
    val hireDate: String = "",
    val isActive: Boolean = true,
    val createdAt: String = ""
) {
    val fullName: String get() = "$firstName $lastName".trim()
    val initials: String get() = "${firstName.take(1)}${lastName.take(1)}".uppercase()
}

@Entity(tableName = "attendance_records")
data class AttendanceRecord(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val date: String, // YYYY-MM-DD
    val checkIn: String? = null, // ISO string or HH:mm
    val checkOut: String? = null, // ISO string or HH:mm
    val hoursWorked: Double? = null,
    val status: String, // "present", "late", "absent", "leave"
    val notes: String = "",
    val createdAt: String = ""
)

@Entity(tableName = "leave_requests")
data class LeaveRequest(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val leaveType: String, // "vacation", "sick", "personal", "other"
    val startDate: String, // YYYY-MM-DD
    val endDate: String, // YYYY-MM-DD
    val daysRequested: Int = 1,
    val reason: String = "",
    val status: String = "pending", // "pending", "approved", "rejected"
    val adminNote: String = "",
    val reviewedAt: String? = null,
    val createdAt: String = ""
)

@Entity(tableName = "salary_profiles")
data class SalaryProfile(
    @PrimaryKey val userId: Long,
    val employeeTypeId: String = "full_time_senior",
    val baseSalary: Double = 65000.0,
    val bankName: String = "HDFC Bank Ltd.",
    val bankAccountNo: String = "••••••••4891",
    val bankIfsc: String = "HDFC0001001",
    val panNo: String = "ABCDE1001F"
)

@Entity(tableName = "invoices")
data class Invoice(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val invoiceNumber: String,
    val userId: Long,
    val month: Int,
    val year: Int,
    val status: String = "approved", // "approved", "paid", "pending"
    val workingDays: Int = 22,
    val presentDays: Int = 20,
    val lateDays: Int = 0,
    val paidLeaves: Int = 0,
    val absentDays: Int = 0,
    val totalHours: Double = 160.0,
    val overtimeHours: Double = 0.0,
    val standardHourlyRate: Double = 0.0,
    val otMultiplier: Double = 1.5,
    val baseSalary: Double = 0.0,
    val effectiveBaseSalary: Double = 0.0,
    val deptBaseSalary: Double = 0.0,
    val appliedSalaryReason: String = "",
    val department: String = "",
    val basicPay: Double = 0.0,
    val basicPercentage: Double = 50.0,
    val hra: Double = 0.0,
    val hraPercentage: Double = 40.0,
    val specialAllowance: Double = 0.0,
    val conveyanceAllowance: Double = 2000.0,
    val medicalAllowance: Double = 1500.0,
    val overtimePay: Double = 0.0,
    val typeCustomEarningsJson: String = "[]",
    val bonus: Double = 0.0,
    val grossEarnings: Double = 0.0,
    val lopDeduction: Double = 0.0,
    val lateDeduction: Double = 0.0,
    val pfDeduction: Double = 0.0,
    val pfPercentage: Double = 6.0,
    val tdsTax: Double = 0.0,
    val tdsPercentage: Double = 10.0,
    val insurance: Double = 500.0,
    val professionalTax: Double = 200.0,
    val typeCustomDeductionsJson: String = "[]",
    val totalDeductions: Double = 0.0,
    val netPay: Double = 0.0,
    val customLineItemsJson: String = "[]",
    val paymentMode: String = "NEFT / Direct Transfer",
    val transactionRef: String = "",
    val paidAt: String? = null,
    val createdAt: String = ""
)

@Entity(tableName = "payroll_rules")
data class PayrollRuleEntity(
    @PrimaryKey val id: Int = 1,
    val ruleJson: String
)
