package com.attendease.data.repository

import android.content.Context
import com.attendease.data.db.AppDatabase
import com.attendease.data.models.*
import com.attendease.domain.payroll.PayrollEngine
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import kotlin.random.Random

class AttendEaseRepository(private val context: Context) {
    private val db = AppDatabase.getDatabase(context)
    private val userDao = db.userDao()
    private val attendanceDao = db.attendanceDao()
    private val leaveDao = db.leaveDao()
    private val salaryDao = db.salaryDao()
    private val invoiceDao = db.invoiceDao()
    private val payrollRuleDao = db.payrollRuleDao()
    private val gson = Gson()

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    private val _flashMessage = MutableStateFlow<FlashMessage?>(null)
    val flashMessage: StateFlow<FlashMessage?> = _flashMessage

    data class FlashMessage(
        val message: String,
        val type: String = "info" // "success", "error", "info", "warning"
    )

    // Flows
    val allUsers: Flow<List<User>> = userDao.getAllUsers()
    val allAttendance: Flow<List<AttendanceRecord>> = attendanceDao.getAllRecords()
    val allLeaves: Flow<List<LeaveRequest>> = leaveDao.getAllLeaves()
    val allSalaryProfiles: Flow<List<SalaryProfile>> = salaryDao.getAllSalaryProfiles()
    val allInvoices: Flow<List<Invoice>> = invoiceDao.getAllInvoices()

    init {
        CoroutineScope(Dispatchers.IO).launch {
            seedDatabaseIfNeeded()
        }
    }

    fun showFlash(message: String, type: String = "info") {
        _flashMessage.value = FlashMessage(message, type)
    }

    fun clearFlash() {
        _flashMessage.value = null
    }

    fun setCurrentUser(user: User?) {
        _currentUser.value = user
    }

    fun getAttendanceForUser(userId: Long): Flow<List<AttendanceRecord>> =
        attendanceDao.getRecordsForUser(userId)

    fun getLeavesForUser(userId: Long): Flow<List<LeaveRequest>> =
        leaveDao.getLeavesForUser(userId)

    fun getInvoicesForUser(userId: Long): Flow<List<Invoice>> =
        invoiceDao.getInvoicesForUser(userId)

    suspend fun getUserById(userId: Long): User? = userDao.getUserById(userId)
    suspend fun getUserByEmail(email: String): User? = userDao.getUserByEmail(email)
    suspend fun insertUser(user: User): Long = userDao.insertUser(user)
    suspend fun updateUser(user: User) = userDao.updateUser(user)
    suspend fun deleteUser(user: User) = userDao.deleteUser(user)

    suspend fun insertAttendance(record: AttendanceRecord): Long = attendanceDao.insertRecord(record)
    suspend fun updateAttendance(record: AttendanceRecord) = attendanceDao.updateRecord(record)
    suspend fun deleteAttendance(record: AttendanceRecord) = attendanceDao.deleteRecord(record)
    suspend fun getAttendanceForUserAndDate(userId: Long, date: String): AttendanceRecord? =
        attendanceDao.getRecordForUserAndDate(userId, date)

    suspend fun insertLeave(leave: LeaveRequest): Long = leaveDao.insertLeave(leave)
    suspend fun updateLeave(leave: LeaveRequest) = leaveDao.updateLeave(leave)
    suspend fun deleteLeave(leave: LeaveRequest) = leaveDao.deleteLeave(leave)

    suspend fun getSalaryProfile(userId: Long): SalaryProfile? = salaryDao.getSalaryProfile(userId)
    suspend fun insertSalaryProfile(profile: SalaryProfile) = salaryDao.insertSalaryProfile(profile)

    suspend fun getInvoiceById(id: Long): Invoice? = invoiceDao.getInvoiceById(id)
    suspend fun insertInvoice(invoice: Invoice): Long = invoiceDao.insertInvoice(invoice)
    suspend fun updateInvoice(invoice: Invoice) = invoiceDao.updateInvoice(invoice)
    suspend fun deleteInvoice(invoice: Invoice) = invoiceDao.deleteInvoice(invoice)
    suspend fun deleteInvoiceBatch(month: Int, year: Int) = invoiceDao.deleteBatch(month, year)

    suspend fun getPayrollRules(): PayrollRules {
        val entity = payrollRuleDao.getPayrollRuleEntity()
        return if (entity != null) {
            try {
                gson.fromJson(entity.ruleJson, PayrollRules::class.java)
            } catch (e: Exception) {
                PayrollRules()
            }
        } else {
            val defaults = PayrollRules()
            savePayrollRules(defaults)
            defaults
        }
    }

    suspend fun savePayrollRules(rules: PayrollRules) {
        val json = gson.toJson(rules)
        payrollRuleDao.insertOrUpdate(PayrollRuleEntity(id = 1, ruleJson = json))
    }

    suspend fun executeMonthlyPayroll(month: Int, year: Int): Int {
        val users = userDao.getAllUsersDirect().filter { it.role == "employee" && it.isActive }
        val attendance = attendanceDao.getAllRecordsDirect()
        val leaves = leaveDao.getAllLeavesDirect()
        val salaries = salaryDao.getAllSalaryProfilesDirect()
        val rules = getPayrollRules()
        val existingInvoices = invoiceDao.getAllInvoicesDirect()

        var count = 0
        for (emp in users) {
            val invoice = PayrollEngine.calculatePayroll(
                userId = emp.id,
                month = month,
                year = year,
                users = users,
                attendance = attendance,
                leaves = leaves,
                salaries = salaries,
                rules = rules
            )
            if (invoice != null) {
                val existing = existingInvoices.find { it.userId == emp.id && it.month == month && it.year == year }
                if (existing != null) {
                    val updated = invoice.copy(
                        id = existing.id,
                        status = existing.status,
                        paymentMode = existing.paymentMode,
                        transactionRef = existing.transactionRef,
                        paidAt = existing.paidAt,
                        customLineItemsJson = existing.customLineItemsJson
                    )
                    invoiceDao.updateInvoice(updated)
                } else {
                    invoiceDao.insertInvoice(invoice)
                }
                count++
            }
        }
        return count
    }

    suspend fun seedDatabaseIfNeeded() {
        val userCount = userDao.getUserCount()
        if (userCount > 0) return

        // 1. Initial Users
        val users = listOf(
            User(
                id = 1,
                firstName = "Admin",
                lastName = "User",
                email = "admin@company.com",
                passwordHash = "admin123",
                role = "admin",
                department = "Management",
                position = "System Administrator",
                phone = "+1 555-0190",
                hireDate = "2022-01-01",
                isActive = true,
                createdAt = "2022-01-01"
            ),
            User(
                id = 2,
                firstName = "Alice",
                lastName = "Johnson",
                email = "alice@company.com",
                passwordHash = "employee123",
                role = "employee",
                department = "Engineering",
                position = "Senior Developer",
                phone = "+1 555-0191",
                hireDate = "2023-01-15",
                isActive = true,
                createdAt = "2023-01-15"
            ),
            User(
                id = 3,
                firstName = "Bob",
                lastName = "Smith",
                email = "bob@company.com",
                passwordHash = "employee123",
                role = "employee",
                department = "Engineering",
                position = "Junior Developer",
                phone = "+1 555-0192",
                hireDate = "2023-03-20",
                isActive = true,
                createdAt = "2023-03-20"
            ),
            User(
                id = 4,
                firstName = "Carol",
                lastName = "Williams",
                email = "carol@company.com",
                passwordHash = "employee123",
                role = "employee",
                department = "Marketing",
                position = "Marketing Manager",
                phone = "+1 555-0193",
                hireDate = "2023-05-10",
                isActive = true,
                createdAt = "2023-05-10"
            ),
            User(
                id = 5,
                firstName = "David",
                lastName = "Brown",
                email = "david@company.com",
                passwordHash = "employee123",
                role = "employee",
                department = "HR",
                position = "HR Specialist",
                phone = "+1 555-0194",
                hireDate = "2023-06-01",
                isActive = true,
                createdAt = "2023-06-01"
            ),
            User(
                id = 6,
                firstName = "Eve",
                lastName = "Davis",
                email = "eve@company.com",
                passwordHash = "employee123",
                role = "employee",
                department = "Finance",
                position = "Financial Analyst",
                phone = "+1 555-0195",
                hireDate = "2023-09-12",
                isActive = true,
                createdAt = "2023-09-12"
            )
        )
        userDao.insertAll(users)

        // 2. Initial Salary Profiles
        val salaries = listOf(
            SalaryProfile(1, "management_exec", 150000.0, "HDFC Bank Ltd.", "••••••••4891", "HDFC0001001", "ABCDE1001F"),
            SalaryProfile(2, "full_time_senior", 95000.0, "State Bank of India", "••••••••4892", "SBIN0002002", "ABCDE1002G"),
            SalaryProfile(3, "full_time_junior", 45000.0, "ICICI Bank Ltd.", "••••••••4893", "ICIC0003003", "ABCDE1003H"),
            SalaryProfile(4, "full_time_senior", 75000.0, "Axis Bank Ltd.", "••••••••4894", "UTIB0004004", "ABCDE1004J"),
            SalaryProfile(5, "full_time_junior", 55000.0, "Kotak Mahindra Bank", "••••••••4895", "KKBK0005005", "ABCDE1005K"),
            SalaryProfile(6, "full_time_senior", 65000.0, "HDFC Bank Ltd.", "••••••••4896", "HDFC0001006", "ABCDE1006L")
        )
        salaryDao.insertAll(salaries)

        // 3. Initial Payroll Rules
        val rules = PayrollRules()
        savePayrollRules(rules)

        // 4. Initial Attendance (30 days)
        val attendanceRecords = mutableListOf<AttendanceRecord>()
        val today = LocalDate.now()
        val employees = users.filter { it.role == "employee" }

        for (i in 30 downTo 0) {
            val d = today.minusDays(i.toLong())
            val dayOfWeek = d.dayOfWeek
            if (dayOfWeek == java.time.DayOfWeek.SATURDAY || dayOfWeek == java.time.DayOfWeek.SUNDAY) continue

            val dateStr = d.format(DateTimeFormatter.ISO_LOCAL_DATE)

            employees.forEach { emp ->
                val pseudoRand = ((emp.id * 17 + i * 13) % 100) / 100.0
                if (pseudoRand < 0.08) return@forEach // absent

                val isLate = pseudoRand > 0.75
                val startHour = if (isLate) 9 else 8
                val startMinute = if (isLate) (20 + (pseudoRand * 20).toInt()) else ((pseudoRand * 45).toInt())
                val hoursWorked = Math.round((7.5 + pseudoRand * 1.5) * 100.0) / 100.0

                val checkInStr = String.format("%02d:%02d", startHour, startMinute)
                val totalMinutes = startHour * 60 + startMinute + (hoursWorked * 60).toInt()
                val endHour = (totalMinutes / 60) % 24
                val endMinute = totalMinutes % 60
                val checkOutStr = String.format("%02d:%02d", endHour, endMinute)

                val isToday = (i == 0)
                var finalCheckOut: String? = checkOutStr
                var finalHours: Double? = hoursWorked

                if (isToday) {
                    if (emp.id == 2L) {
                        finalCheckOut = null
                        finalHours = null
                    } else if (emp.id == 3L) {
                        return@forEach
                    }
                }

                attendanceRecords.add(
                    AttendanceRecord(
                        userId = emp.id,
                        date = dateStr,
                        checkIn = checkInStr,
                        checkOut = finalCheckOut,
                        hoursWorked = finalHours,
                        status = if (isLate) "late" else "present",
                        notes = "",
                        createdAt = dateStr
                    )
                )
            }
        }
        attendanceDao.insertAll(attendanceRecords)

        // 5. Initial Leaves
        val leaves = listOf(
            LeaveRequest(
                id = 1,
                userId = 2,
                leaveType = "vacation",
                startDate = today.plusDays(5).format(DateTimeFormatter.ISO_LOCAL_DATE),
                endDate = today.plusDays(7).format(DateTimeFormatter.ISO_LOCAL_DATE),
                daysRequested = 3,
                reason = "Annual family vacation",
                status = "approved",
                adminNote = "Approved. Enjoy your vacation!",
                reviewedAt = today.toString(),
                createdAt = today.minusDays(2).toString()
            ),
            LeaveRequest(
                id = 2,
                userId = 3,
                leaveType = "sick",
                startDate = today.minusDays(3).format(DateTimeFormatter.ISO_LOCAL_DATE),
                endDate = today.minusDays(2).format(DateTimeFormatter.ISO_LOCAL_DATE),
                daysRequested = 2,
                reason = "Fever and flu",
                status = "approved",
                adminNote = "Get well soon.",
                reviewedAt = today.minusDays(3).toString(),
                createdAt = today.minusDays(4).toString()
            ),
            LeaveRequest(
                id = 3,
                userId = 4,
                leaveType = "personal",
                startDate = today.plusDays(10).format(DateTimeFormatter.ISO_LOCAL_DATE),
                endDate = today.plusDays(10).format(DateTimeFormatter.ISO_LOCAL_DATE),
                daysRequested = 1,
                reason = "Personal errands and bank work",
                status = "pending",
                adminNote = "",
                reviewedAt = null,
                createdAt = today.minusDays(1).toString()
            ),
            LeaveRequest(
                id = 4,
                userId = 5,
                leaveType = "vacation",
                startDate = today.plusDays(15).format(DateTimeFormatter.ISO_LOCAL_DATE),
                endDate = today.plusDays(20).format(DateTimeFormatter.ISO_LOCAL_DATE),
                daysRequested = 6,
                reason = "Trip to Europe",
                status = "pending",
                adminNote = "",
                reviewedAt = null,
                createdAt = today.minusDays(1).toString()
            ),
            LeaveRequest(
                id = 5,
                userId = 6,
                leaveType = "sick",
                startDate = today.minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE),
                endDate = today.minusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE),
                daysRequested = 1,
                reason = "Dental appointment",
                status = "rejected",
                adminNote = "Short notice, please reschedule if non-emergency.",
                reviewedAt = today.minusDays(1).toString(),
                createdAt = today.minusDays(2).toString()
            )
        )
        leaveDao.insertAll(leaves)

        // 6. Generate initial invoices for current month and previous month
        val currentMonth = today.monthValue
        val currentYear = today.year
        val prevMonth = if (currentMonth == 1) 12 else currentMonth - 1
        val prevYear = if (currentMonth == 1) currentYear - 1 else currentYear

        // Generate previous month (marked as Paid)
        employees.forEach { emp ->
            val prevInv = PayrollEngine.calculatePayroll(
                userId = emp.id,
                month = prevMonth,
                year = prevYear,
                users = users,
                attendance = attendanceRecords,
                leaves = leaves,
                salaries = salaries,
                rules = rules
            )
            if (prevInv != null) {
                invoiceDao.insertInvoice(
                    prevInv.copy(
                        status = "paid",
                        paymentMode = "NEFT / Direct Transfer",
                        transactionRef = "TXN" + (10000000 + (emp.id * 1234567) % 90000000),
                        paidAt = "$prevYear-${prevMonth.toString().padStart(2, '0')}-28"
                    )
                )
            }
        }

        // Generate current month (marked as Approved)
        employees.forEach { emp ->
            val curInv = PayrollEngine.calculatePayroll(
                userId = emp.id,
                month = currentMonth,
                year = currentYear,
                users = users,
                attendance = attendanceRecords,
                leaves = leaves,
                salaries = salaries,
                rules = rules
            )
            if (curInv != null) {
                invoiceDao.insertInvoice(curInv.copy(status = "approved"))
            }
        }
    }
}
