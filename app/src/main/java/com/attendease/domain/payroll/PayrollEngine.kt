package com.attendease.domain.payroll

import com.attendease.data.models.*
import com.google.gson.Gson
import java.text.NumberFormat
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.util.Locale
import kotlin.math.max
import kotlin.math.roundToInt

object PayrollEngine {
    private val gson = Gson()

    fun formatINR(amount: Double?): String {
        if (amount == null || amount.isNaN()) return "₹0"
        val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        format.maximumFractionDigits = 0
        return format.format(amount)
    }

    fun numberToWordsINR(num: Double?): String {
        if (num == null || num.isNaN() || num <= 0.0) return "Zero Rupees Only"
        val a = arrayOf(
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        )
        val b = arrayOf("", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety")

        fun inWords(n: Long): String {
            if (n < 20) return a[n.toInt()]
            val digit = (n % 10).toInt()
            return b[(n / 10).toInt()] + (if (digit != 0) " " + a[digit] else "")
        }

        var str = ""
        val whole = num.toLong()
        val paise = ((num - whole) * 100).roundToInt()

        val crore = whole / 10000000L
        var rem = whole % 10000000L
        val lakh = rem / 100000L
        rem %= 100000L
        val thousand = rem / 1000L
        rem %= 1000L
        val hundred = rem / 100L
        val tens = rem % 100L

        if (crore > 0) str += inWords(crore) + " Crore "
        if (lakh > 0) str += inWords(lakh) + " Lakh "
        if (thousand > 0) str += inWords(thousand) + " Thousand "
        if (hundred > 0) str += inWords(hundred) + " Hundred "
        if (tens > 0) str += (if (str.isNotEmpty()) "and " else "") + inWords(tens) + " "

        str = str.trim().ifEmpty { "Zero" }
        str += " Rupees"
        if (paise > 0) {
            str += " and " + inWords(paise.toLong()) + " Paise"
        }
        return "$str Only"
    }

    fun countWorkingDays(year: Int, month: Int): Int {
        val ym = YearMonth.of(year, month)
        var days = 0
        for (day in 1..ym.lengthOfMonth()) {
            val date = LocalDate.of(year, month, day)
            if (date.dayOfWeek != DayOfWeek.SATURDAY && date.dayOfWeek != DayOfWeek.SUNDAY) {
                days++
            }
        }
        return if (days > 0) days else 22
    }

    fun calculatePayroll(
        userId: Long,
        month: Int,
        year: Int,
        users: List<User>,
        attendance: List<AttendanceRecord>,
        leaves: List<LeaveRequest>,
        salaries: List<SalaryProfile>,
        rules: PayrollRules
    ): Invoice? {
        val emp = users.find { it.id == userId } ?: return null
        val salRecord = salaries.find { it.userId == emp.id }
            ?: SalaryProfile(userId = emp.id, employeeTypeId = "full_time_senior", baseSalary = 65000.0)

        val empType = rules.employeeTypes.find { it.id == salRecord.employeeTypeId }
            ?: rules.employeeTypes.firstOrNull()
            ?: EmployeeType("default", "Standard", 65000.0)

        // 4-Tier Priority Cascade & Higher Salary Logic
        var appliedHraPercent = rules.salaryStructure.hraPercentage
        var appliedReason = "Standard Company Baseline"

        val deptRule = rules.departmentRules.find { it.department.equals(emp.department, ignoreCase = true) }
        val deptMinSalary = deptRule?.minBaseSalary ?: 0.0
        val categoryBaseSalary = empType.baseSalary
        val individualBaseSalary = salRecord.baseSalary

        val effectiveBaseSalary = maxOf(individualBaseSalary, categoryBaseSalary, deptMinSalary)

        if (effectiveBaseSalary > individualBaseSalary) {
            appliedReason = if (effectiveBaseSalary == deptMinSalary) {
                "Elevated to Department Baseline Minimum (₹${deptMinSalary.toInt()})"
            } else {
                "Elevated to Category Profile Standard (₹${categoryBaseSalary.toInt()})"
            }
        }

        // Evaluate Priority Overrides
        val posOverride = rules.overrides.find { it.scope.equals("position", ignoreCase = true) && it.target.equals(emp.position, ignoreCase = true) }
        if (posOverride != null && posOverride.ruleType == "hra_percentage") {
            appliedHraPercent = posOverride.value
            appliedReason += " | Position Override (${emp.position} HRA ${appliedHraPercent.toInt()}%)"
        } else {
            val deptOverride = rules.overrides.find { it.scope.equals("department", ignoreCase = true) && it.target.equals(emp.department, ignoreCase = true) }
            if (deptOverride != null && deptOverride.ruleType == "hra_percentage") {
                appliedHraPercent = deptOverride.value
                appliedReason += " | Dept Override (${emp.department} HRA ${appliedHraPercent.toInt()}%)"
            }
        }

        // Attendance metrics
        val monthPadded = month.toString().padStart(2, '0')
        val monthPrefix = "$year-$monthPadded"

        val userAtt = attendance.filter { it.userId == emp.id && it.date.startsWith(monthPrefix) }
        val workingDays = if (rules.globalRules.workingDaysMode == "auto") {
            countWorkingDays(year, month)
        } else {
            rules.attendanceLopConfig.fixedWorkingDays
        }

        val presentDays = userAtt.count { it.status == "present" || it.status == "late" }
        val lateDays = userAtt.count { it.status == "late" }

        val userLeaves = leaves.filter { it.userId == emp.id && it.status == "approved" }
        var paidLeaves = 0
        userLeaves.forEach { l ->
            if (l.startDate.startsWith(monthPrefix)) {
                paidLeaves += l.daysRequested
            }
        }

        val loggedDaysCount = presentDays + paidLeaves
        val absentDays = max(0, workingDays - loggedDaysCount)

        var totalHours = 0.0
        var overtimeHours = 0.0

        userAtt.forEach { a ->
            val hrs = a.hoursWorked ?: 8.0
            totalHours += hrs
            if (hrs > rules.overtimeConfig.dailyThreshold) {
                overtimeHours += (hrs - rules.overtimeConfig.dailyThreshold)
            }
        }

        // Calculate earnings components
        val basicPercentage = rules.salaryStructure.basicPercentage / 100.0
        val basicPay = (effectiveBaseSalary * basicPercentage).roundToInt().toDouble()
        val hraPay = (basicPay * (appliedHraPercent / 100.0)).roundToInt().toDouble()
        val conveyance = rules.salaryStructure.conveyanceAllowance
        val medical = rules.salaryStructure.medicalAllowance

        var specialAllowance = effectiveBaseSalary - (basicPay + hraPay + conveyance + medical)
        if (specialAllowance < 0.0) specialAllowance = 0.0

        val standardHourlyRate = effectiveBaseSalary / (workingDays * 8.0)
        val overtimePay = if (rules.overtimeConfig.enabled) {
            (overtimeHours * standardHourlyRate * rules.overtimeConfig.standardMultiplier).roundToInt().toDouble()
        } else 0.0

        var bonus = 0.0
        val customEarningsList = mutableListOf<CustomLineItem>()
        if (empType.customAllowance > 0) {
            customEarningsList.add(
                CustomLineItem(
                    label = empType.customAllowanceLabel.ifEmpty { "Category Allowance" },
                    amount = empType.customAllowance,
                    type = "earning"
                )
            )
            bonus += empType.customAllowance
        }

        val grossEarnings = basicPay + hraPay + specialAllowance + conveyance + medical + overtimePay + bonus

        // Calculate deductions
        val dailyRate = effectiveBaseSalary / workingDays.toDouble()
        val lopDeduction = (absentDays * dailyRate).roundToInt().toDouble()

        val lateGrace = rules.attendanceLopConfig.lateGraceCount
        val latePenaltyDays = max(0, lateDays - lateGrace)
        var lateDeduction = 0.0
        if (latePenaltyDays > 0) {
            lateDeduction = when (rules.attendanceLopConfig.latePenaltyType) {
                "half_day" -> (latePenaltyDays * 0.5 * dailyRate).roundToInt().toDouble()
                "quarter_day" -> (latePenaltyDays * 0.25 * dailyRate).roundToInt().toDouble()
                "flat" -> latePenaltyDays * rules.attendanceLopConfig.lateFlatPenalty
                else -> 0.0
            }
        }

        var pfDeduction = 0.0
        if (rules.deductionsConfig.pfEnabled) {
            pfDeduction = (basicPay * (rules.deductionsConfig.pfRate / 100.0)).roundToInt().toDouble()
        }

        var tdsTax = 0.0
        if (rules.deductionsConfig.tdsEnabled) {
            tdsTax = (grossEarnings * (rules.deductionsConfig.tdsRate / 100.0)).roundToInt().toDouble()
        }

        var professionalTax = 0.0
        if (rules.deductionsConfig.ptEnabled) {
            if (rules.deductionsConfig.ptMode == "slab") {
                val slab = rules.deductionsConfig.ptSlabs.find { grossEarnings >= it.min && grossEarnings <= it.max }
                professionalTax = slab?.tax ?: 200.0
            } else {
                professionalTax = rules.deductionsConfig.ptFlatAmount
            }
        }

        val insurance = rules.deductionsConfig.healthInsurance

        val customDeductionsList = mutableListOf<CustomLineItem>()
        if (empType.customDeduction > 0) {
            customDeductionsList.add(
                CustomLineItem(
                    label = empType.customDeductionLabel.ifEmpty { "Category Deduction" },
                    amount = empType.customDeduction,
                    type = "deduction"
                )
            )
        }

        val extraDeductionsTotal = customDeductionsList.sumOf { it.amount }
        val totalDeductions = lopDeduction + lateDeduction + pfDeduction + tdsTax + professionalTax + insurance + extraDeductionsTotal
        val netPay = max(0.0, grossEarnings - totalDeductions)

        val invNum = "INV-$year-$monthPadded-000${emp.id}"

        return Invoice(
            invoiceNumber = invNum,
            userId = emp.id,
            month = month,
            year = year,
            status = "approved",
            workingDays = workingDays,
            presentDays = presentDays,
            lateDays = lateDays,
            paidLeaves = paidLeaves,
            absentDays = absentDays,
            totalHours = totalHours,
            overtimeHours = overtimeHours,
            standardHourlyRate = standardHourlyRate,
            otMultiplier = rules.overtimeConfig.standardMultiplier,
            baseSalary = individualBaseSalary,
            effectiveBaseSalary = effectiveBaseSalary,
            deptBaseSalary = deptMinSalary,
            appliedSalaryReason = appliedReason,
            department = emp.department.ifEmpty { "General" },
            basicPay = basicPay,
            basicPercentage = rules.salaryStructure.basicPercentage,
            hra = hraPay,
            hraPercentage = appliedHraPercent,
            specialAllowance = specialAllowance,
            conveyanceAllowance = conveyance,
            medicalAllowance = medical,
            overtimePay = overtimePay,
            typeCustomEarningsJson = gson.toJson(customEarningsList),
            bonus = bonus,
            grossEarnings = grossEarnings,
            lopDeduction = lopDeduction,
            lateDeduction = lateDeduction,
            pfDeduction = pfDeduction,
            pfPercentage = rules.deductionsConfig.pfRate,
            tdsTax = tdsTax,
            tdsPercentage = rules.deductionsConfig.tdsRate,
            insurance = insurance,
            professionalTax = professionalTax,
            typeCustomDeductionsJson = gson.toJson(customDeductionsList),
            totalDeductions = totalDeductions,
            netPay = netPay,
            customLineItemsJson = "[]",
            paymentMode = "NEFT / Direct Transfer",
            transactionRef = "",
            paidAt = null,
            createdAt = java.time.Instant.now().toString()
        )
    }
}
