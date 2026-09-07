package com.attendease.data.models

data class CustomLineItem(
    val label: String,
    val amount: Double,
    val type: String = "earning" // "earning" or "deduction"
)

data class CompanyInfo(
    var companyName: String = "AttendEase Technologies Pvt. Ltd.",
    var address: String = "Cyber City, Sector 24, DLF Phase 3, Gurugram, HR 122002",
    var gstin: String = "07AABCA1234F1Z8",
    var email: String = "contact@attendease.com",
    var signatoryTitle: String = "Finance & Payroll Department",
    var disclaimer: String = "This is a computer-generated tax invoice and salary certificate. No physical signature is required under IT rules."
)

data class GlobalRules(
    var currency: String = "INR",
    var currencySymbol: String = "₹",
    var workingDaysMode: String = "auto",
    var fixedWorkingDays: Int = 22,
    var dailyOvertimeThreshold: Double = 8.0,
    var weeklyOvertimeThreshold: Double = 40.0,
    var overtimeMultiplier: Double = 1.5,
    var overtimeEnabled: Boolean = true,
    var lateGraceCount: Int = 2,
    var latePenaltyType: String = "half_day",
    var lateFlatPenalty: Double = 500.0,
    var pfRate: Double = 6.0,
    var defaultTdsRate: Double = 10.0,
    var healthInsurance: Double = 500.0,
    var professionalTax: Double = 200.0
)

data class SalaryStructure(
    var basicPercentage: Double = 50.0,
    var hraPercentage: Double = 40.0,
    var daEnabled: Boolean = false,
    var daPercentage: Double = 10.0,
    var conveyanceAllowance: Double = 2000.0,
    var medicalAllowance: Double = 1500.0,
    var specialAllowanceMode: String = "residual"
)

data class PtSlab(
    val min: Double,
    val max: Double,
    val tax: Double
)

data class DeductionsConfig(
    var pfEnabled: Boolean = true,
    var pfRate: Double = 6.0,
    var pfBasedOn: String = "Basic Salary",
    var tdsEnabled: Boolean = true,
    var tdsRate: Double = 10.0,
    var ptEnabled: Boolean = true,
    var ptMode: String = "slab",
    var ptFlatAmount: Double = 200.0,
    var ptSlabs: List<PtSlab> = listOf(
        PtSlab(0.0, 7500.0, 0.0),
        PtSlab(7501.0, 10000.0, 175.0),
        PtSlab(10001.0, 9999999.0, 200.0)
    ),
    var healthInsurance: Double = 500.0
)

data class AttendanceLopConfig(
    var basis: String = "working_days",
    var fixedWorkingDays: Int = 22,
    var lateGraceCount: Int = 2,
    var latePenaltyType: String = "half_day", // "half_day", "quarter_day", "flat", "none"
    var lateFlatPenalty: Double = 500.0
)

data class OvertimeConfig(
    var enabled: Boolean = true,
    var dailyThreshold: Double = 8.0,
    var weeklyThreshold: Double = 40.0,
    var standardMultiplier: Double = 1.5,
    var weekendMultiplier: Double = 2.0,
    var holidayMultiplier: Double = 2.0
)

data class DepartmentRule(
    val id: String,
    val department: String,
    var minBaseSalary: Double,
    val description: String = ""
)

data class RuleOverride(
    val id: String,
    val scope: String, // "department" or "position"
    val target: String,
    val ruleType: String, // "hra_percentage"
    val value: Double,
    val note: String = ""
)

data class EmployeeType(
    val id: String,
    val name: String,
    var baseSalary: Double,
    val description: String = "",
    var customAllowance: Double = 0.0,
    var customAllowanceLabel: String = "",
    var customDeduction: Double = 0.0,
    var customDeductionLabel: String = ""
)

data class PayrollRules(
    var ruleStatus: String = "ACTIVE",
    var version: String = "2.4.0",
    var effectiveFrom: String = "2026-08-01",
    var company: CompanyInfo = CompanyInfo(),
    var globalRules: GlobalRules = GlobalRules(),
    var salaryStructure: SalaryStructure = SalaryStructure(),
    var deductionsConfig: DeductionsConfig = DeductionsConfig(),
    var attendanceLopConfig: AttendanceLopConfig = AttendanceLopConfig(),
    var overtimeConfig: OvertimeConfig = OvertimeConfig(),
    var departmentRules: MutableList<DepartmentRule> = mutableListOf(
        DepartmentRule("management", "Management", 150000.0, "Executive Leadership, Admin & Directors"),
        DepartmentRule("engineering", "Engineering", 95000.0, "Software Engineering, Architecture & DevOps"),
        DepartmentRule("finance", "Finance", 75000.0, "Financial Planning, Accounting & Audit"),
        DepartmentRule("sales", "Sales", 70000.0, "Direct Sales, Accounts & Business Development"),
        DepartmentRule("marketing", "Marketing", 65000.0, "Brand Marketing, Growth & Communications"),
        DepartmentRule("hr", "HR", 60000.0, "Talent Acquisition, People Operations & Relations"),
        DepartmentRule("operations", "Operations", 55000.0, "Support, Logistics & Workplace Operations")
    ),
    var overrides: MutableList<RuleOverride> = mutableListOf(
        RuleOverride("ov_eng_hra", "department", "Engineering", "hra_percentage", 45.0, "Engineering High HRA Tier"),
        RuleOverride("ov_mgr_hra", "position", "System Administrator", "hra_percentage", 50.0, "Admin/Manager HRA Tier")
    ),
    var employeeTypes: MutableList<EmployeeType> = mutableListOf(
        EmployeeType("full_time_senior", "Full-Time Senior Professional", 95000.0, "Senior Software Engineers, Leads & Architects", 5000.0, "Senior Tech Allowance"),
        EmployeeType("full_time_junior", "Full-Time Junior Associate", 45000.0, "Junior Developers, Support Staff & Analysts", 2000.0, "Learning Allowance"),
        EmployeeType("management_exec", "Executive Management", 150000.0, "Directors, VPs & Department Heads", 10000.0, "Executive Retention Bonus"),
        EmployeeType("intern", "Stipend Intern", 20000.0, "Trainees & Graduate Interns", 1000.0, "Book & Internet Allowance"),
        EmployeeType("contractor", "Contract Staff (Retainer)", 60000.0, "Independent Consultants & Retainers", 0.0, "", 500.0, "Admin Overhead")
    )
)
