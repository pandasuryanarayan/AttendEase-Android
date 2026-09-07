package com.attendease.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.attendease.data.models.*
import com.attendease.data.repository.AttendEaseRepository
import com.attendease.domain.payroll.PayrollEngine
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

class MainViewModel(private val repository: AttendEaseRepository) : ViewModel() {

    private val gson = Gson()

    val currentUser: StateFlow<User?> = repository.currentUser
    val flashMessage: StateFlow<AttendEaseRepository.FlashMessage?> = repository.flashMessage

    val users: StateFlow<List<User>> = repository.allUsers.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val attendance: StateFlow<List<AttendanceRecord>> = repository.allAttendance.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val leaves: StateFlow<List<LeaveRequest>> = repository.allLeaves.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val salaryProfiles: StateFlow<List<SalaryProfile>> = repository.allSalaryProfiles.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    val invoices: StateFlow<List<Invoice>> = repository.allInvoices.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList()
    )

    private val _payrollRules = MutableStateFlow(PayrollRules())
    val payrollRules: StateFlow<PayrollRules> = _payrollRules.asStateFlow()

    init {
        viewModelScope.launch {
            _payrollRules.value = repository.getPayrollRules()
        }
    }

    fun showFlash(msg: String, type: String = "info") {
        repository.showFlash(msg, type)
    }

    fun clearFlash() {
        repository.clearFlash()
    }

    // ─── AUTHENTICATION ───
    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val user = repository.getUserByEmail(email.trim())
            if (user == null) {
                showFlash("User not found with email: $email", "error")
                return@launch
            }
            if (!user.isActive) {
                showFlash("Account is inactive. Please contact your administrator.", "error")
                return@launch
            }
            if (user.passwordHash != pass.trim()) {
                showFlash("Invalid credentials. Please verify your password.", "error")
                return@launch
            }
            repository.setCurrentUser(user)
            showFlash("Welcome back, ${user.firstName}!", "success")
            onSuccess()
        }
    }

    fun logout(onSuccess: () -> Unit) {
        repository.setCurrentUser(null)
        showFlash("You have signed out successfully.", "info")
        onSuccess()
    }

    fun register(
        firstName: String,
        lastName: String,
        email: String,
        pass: String,
        department: String,
        position: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            val existing = repository.getUserByEmail(email.trim())
            if (existing != null) {
                showFlash("An account with this email already exists.", "error")
                return@launch
            }
            val newUser = User(
                firstName = firstName.trim(),
                lastName = lastName.trim(),
                email = email.trim(),
                passwordHash = pass.trim(),
                role = "employee",
                department = department.trim(),
                position = position.trim(),
                hireDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE),
                isActive = true,
                createdAt = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
            )
            val newId = repository.insertUser(newUser)
            // default salary
            repository.insertSalaryProfile(
                SalaryProfile(userId = newId, employeeTypeId = "full_time_junior", baseSalary = 50000.0)
            )
            showFlash("Account created successfully! Please sign in.", "success")
            onSuccess()
        }
    }

    // ─── ATTENDANCE (EMPLOYEE) ───
    fun checkIn(userId: Long) {
        viewModelScope.launch {
            val todayStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
            val nowTime = LocalTime.now()
            val timeStr = nowTime.format(DateTimeFormatter.ofPattern("HH:mm"))

            val existing = repository.getAttendanceForUserAndDate(userId, todayStr)
            if (existing != null && existing.checkIn != null) {
                showFlash("You have already checked in today at ${existing.checkIn}", "warning")
                return@launch
            }

            // 09:15 threshold for late
            val isLate = nowTime.isAfter(LocalTime.of(9, 15))
            val record = AttendanceRecord(
                userId = userId,
                date = todayStr,
                checkIn = timeStr,
                checkOut = null,
                hoursWorked = null,
                status = if (isLate) "late" else "present",
                notes = "",
                createdAt = todayStr
            )
            repository.insertAttendance(record)
            val statusTxt = if (isLate) "Late Check-in logged ($timeStr)" else "Present Check-in logged ($timeStr)"
            showFlash("Checked in successfully! $statusTxt", if (isLate) "warning" else "success")
        }
    }

    fun checkOut(userId: Long) {
        viewModelScope.launch {
            val todayStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
            val nowTime = LocalTime.now()
            val timeStr = nowTime.format(DateTimeFormatter.ofPattern("HH:mm"))

            val existing = repository.getAttendanceForUserAndDate(userId, todayStr)
            if (existing == null || existing.checkIn == null) {
                showFlash("You have not checked in yet today.", "warning")
                return@launch
            }
            if (existing.checkOut != null) {
                showFlash("You have already checked out today at ${existing.checkOut}", "info")
                return@launch
            }

            val checkInParts = existing.checkIn.split(":")
            val inHour = checkInParts.getOrNull(0)?.toIntOrNull() ?: 9
            val inMin = checkInParts.getOrNull(1)?.toIntOrNull() ?: 0
            val checkInMinutes = inHour * 60 + inMin
            val checkOutMinutes = nowTime.hour * 60 + nowTime.minute
            val diffMinutes = Math.max(0, checkOutMinutes - checkInMinutes)
            val hours = Math.round((diffMinutes / 60.0) * 100.0) / 100.0

            val updated = existing.copy(
                checkOut = timeStr,
                hoursWorked = if (hours > 0) hours else 8.0
            )
            repository.updateAttendance(updated)
            showFlash("Checked out successfully at $timeStr. Total: ${updated.hoursWorked} hrs.", "success")
        }
    }

    // ─── LEAVE MANAGEMENT ───
    fun submitLeaveRequest(
        userId: Long,
        type: String,
        startDate: String,
        endDate: String,
        reason: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            try {
                val start = LocalDate.parse(startDate)
                val end = LocalDate.parse(endDate)
                val days = java.time.temporal.ChronoUnit.DAYS.between(start, end).toInt() + 1
                val request = LeaveRequest(
                    userId = userId,
                    leaveType = type,
                    startDate = startDate,
                    endDate = endDate,
                    daysRequested = if (days > 0) days else 1,
                    reason = reason,
                    status = "pending",
                    createdAt = LocalDate.now().toString()
                )
                repository.insertLeave(request)
                showFlash("Leave request for $days day(s) submitted for approval.", "success")
                onSuccess()
            } catch (e: Exception) {
                showFlash("Invalid date range for leave request.", "error")
            }
        }
    }

    fun cancelLeaveRequest(leave: LeaveRequest) {
        viewModelScope.launch {
            repository.deleteLeave(leave)
            showFlash("Leave request cancelled.", "info")
        }
    }

    fun reviewLeaveRequest(leave: LeaveRequest, approved: Boolean, adminNote: String) {
        viewModelScope.launch {
            val updated = leave.copy(
                status = if (approved) "approved" else "rejected",
                adminNote = adminNote,
                reviewedAt = LocalDate.now().toString()
            )
            repository.updateLeave(updated)
            showFlash("Leave request has been ${updated.status}.", if (approved) "success" else "warning")
        }
    }

    // ─── ADMIN: EMPLOYEE CRUD ───
    fun addOrUpdateEmployee(user: User, baseSalary: Double, categoryId: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            if (user.id == 0L) {
                val existing = repository.getUserByEmail(user.email.trim())
                if (existing != null) {
                    showFlash("User with email ${user.email} already exists.", "error")
                    return@launch
                }
                val newId = repository.insertUser(user)
                repository.insertSalaryProfile(
                    SalaryProfile(
                        userId = newId,
                        employeeTypeId = categoryId,
                        baseSalary = baseSalary
                    )
                )
                showFlash("Employee ${user.fullName} added successfully.", "success")
            } else {
                repository.updateUser(user)
                val existingProfile = repository.getSalaryProfile(user.id)
                if (existingProfile != null) {
                    repository.insertSalaryProfile(
                        existingProfile.copy(
                            employeeTypeId = categoryId,
                            baseSalary = baseSalary
                        )
                    )
                } else {
                    repository.insertSalaryProfile(
                        SalaryProfile(userId = user.id, employeeTypeId = categoryId, baseSalary = baseSalary)
                    )
                }
                showFlash("Employee ${user.fullName} updated.", "success")
            }
            onSuccess()
        }
    }

    fun toggleUserActive(user: User) {
        viewModelScope.launch {
            val updated = user.copy(isActive = !user.isActive)
            repository.updateUser(updated)
            val st = if (updated.isActive) "activated" else "deactivated"
            showFlash("${user.fullName} has been $st.", "info")
        }
    }

    fun deleteEmployee(user: User) {
        viewModelScope.launch {
            repository.deleteUser(user)
            showFlash("Employee ${user.fullName} deleted.", "info")
        }
    }

    // ─── ADMIN: ATTENDANCE CRUD ───
    fun updateAttendanceRecord(record: AttendanceRecord, onSuccess: () -> Unit) {
        viewModelScope.launch {
            var hrs = record.hoursWorked
            if (record.checkIn != null && record.checkOut != null) {
                val inParts = record.checkIn.split(":")
                val outParts = record.checkOut.split(":")
                val inMin = (inParts.getOrNull(0)?.toIntOrNull() ?: 9) * 60 + (inParts.getOrNull(1)?.toIntOrNull() ?: 0)
                val outMin = (outParts.getOrNull(0)?.toIntOrNull() ?: 17) * 60 + (outParts.getOrNull(1)?.toIntOrNull() ?: 0)
                val diff = Math.max(0, outMin - inMin)
                hrs = Math.round((diff / 60.0) * 100.0) / 100.0
            }
            repository.updateAttendance(record.copy(hoursWorked = hrs))
            showFlash("Attendance record updated.", "success")
            onSuccess()
        }
    }

    // ─── ADMIN: PAYROLL RUN ───
    fun runPayroll(month: Int, year: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val count = repository.executeMonthlyPayroll(month, year)
            showFlash("Payroll computed successfully! Generated $count payslip invoices.", "success")
            onSuccess()
        }
    }

    fun markInvoicePaid(invoice: Invoice, mode: String, txnRef: String, date: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val updated = invoice.copy(
                status = "paid",
                paymentMode = mode,
                transactionRef = txnRef.ifEmpty { "TXN" + (10000000..99999999).random() },
                paidAt = date.ifEmpty { LocalDate.now().toString() }
            )
            repository.updateInvoice(updated)
            showFlash("Invoice ${invoice.invoiceNumber} marked as PAID.", "success")
            onSuccess()
        }
    }

    fun deleteInvoiceBatch(month: Int, year: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            repository.deleteInvoiceBatch(month, year)
            showFlash("Deleted all payroll invoices for period $year-${month.toString().padStart(2, '0')}.", "warning")
            onSuccess()
        }
    }

    // ─── PAYSLIP / INVOICE LINE ITEMS ───
    fun addInvoiceCustomLineItem(invoice: Invoice, label: String, amount: Double, type: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val listType = object : TypeToken<MutableList<CustomLineItem>>() {}.type
            val items: MutableList<CustomLineItem> = try {
                gson.fromJson(invoice.customLineItemsJson, listType) ?: mutableListOf()
            } catch (e: Exception) {
                mutableListOf()
            }
            items.add(CustomLineItem(label = label, amount = amount, type = type))

            var gross = invoice.grossEarnings
            var totalDeductions = invoice.totalDeductions
            if (type == "earning") {
                gross += amount
            } else {
                totalDeductions += amount
            }
            val net = Math.max(0.0, gross - totalDeductions)

            val updated = invoice.copy(
                customLineItemsJson = gson.toJson(items),
                grossEarnings = gross,
                totalDeductions = totalDeductions,
                netPay = net
            )
            repository.updateInvoice(updated)
            showFlash("Line item '$label' added to invoice.", "success")
            onSuccess()
        }
    }

    // ─── PAYROLL RULES / SETTINGS ───
    fun updatePayrollRules(updatedRules: PayrollRules) {
        viewModelScope.launch {
            repository.savePayrollRules(updatedRules)
            _payrollRules.value = updatedRules
            showFlash("Payroll rules and policy settings saved.", "success")
        }
    }

    class Factory(private val repository: AttendEaseRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return MainViewModel(repository) as T
        }
    }
}
