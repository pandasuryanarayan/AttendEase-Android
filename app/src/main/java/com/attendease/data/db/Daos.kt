package com.attendease.data.db

import androidx.room.*
import com.attendease.data.models.*
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY id ASC")
    fun getAllUsers(): Flow<List<User>>

    @Query("SELECT * FROM users ORDER BY id ASC")
    suspend fun getAllUsersDirect(): List<User>

    @Query("SELECT COUNT(*) FROM users")
    suspend fun getUserCount(): Int

    @Query("SELECT * FROM users WHERE id = :userId LIMIT 1")
    suspend fun getUserById(userId: Long): User?

    @Query("SELECT * FROM users WHERE email = :email LIMIT 1")
    suspend fun getUserByEmail(email: String): User?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: User): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(users: List<User>)

    @Update
    suspend fun updateUser(user: User)

    @Delete
    suspend fun deleteUser(user: User)
}

@Dao
interface AttendanceDao {
    @Query("SELECT * FROM attendance_records ORDER BY date DESC, id DESC")
    fun getAllRecords(): Flow<List<AttendanceRecord>>

    @Query("SELECT * FROM attendance_records ORDER BY date DESC, id DESC")
    suspend fun getAllRecordsDirect(): List<AttendanceRecord>

    @Query("SELECT * FROM attendance_records WHERE userId = :userId ORDER BY date DESC")
    fun getRecordsForUser(userId: Long): Flow<List<AttendanceRecord>>

    @Query("SELECT * FROM attendance_records WHERE userId = :userId AND date = :date LIMIT 1")
    suspend fun getRecordForUserAndDate(userId: Long, date: String): AttendanceRecord?

    @Query("SELECT * FROM attendance_records WHERE date = :date")
    fun getRecordsForDate(date: String): Flow<List<AttendanceRecord>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: AttendanceRecord): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(records: List<AttendanceRecord>)

    @Update
    suspend fun updateRecord(record: AttendanceRecord)

    @Delete
    suspend fun deleteRecord(record: AttendanceRecord)
}

@Dao
interface LeaveDao {
    @Query("SELECT * FROM leave_requests ORDER BY createdAt DESC, id DESC")
    fun getAllLeaves(): Flow<List<LeaveRequest>>

    @Query("SELECT * FROM leave_requests ORDER BY createdAt DESC, id DESC")
    suspend fun getAllLeavesDirect(): List<LeaveRequest>

    @Query("SELECT * FROM leave_requests WHERE userId = :userId ORDER BY createdAt DESC")
    fun getLeavesForUser(userId: Long): Flow<List<LeaveRequest>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLeave(leave: LeaveRequest): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(leaves: List<LeaveRequest>)

    @Update
    suspend fun updateLeave(leave: LeaveRequest)

    @Delete
    suspend fun deleteLeave(leave: LeaveRequest)
}

@Dao
interface SalaryDao {
    @Query("SELECT * FROM salary_profiles")
    fun getAllSalaryProfiles(): Flow<List<SalaryProfile>>

    @Query("SELECT * FROM salary_profiles")
    suspend fun getAllSalaryProfilesDirect(): List<SalaryProfile>

    @Query("SELECT * FROM salary_profiles WHERE userId = :userId LIMIT 1")
    suspend fun getSalaryProfile(userId: Long): SalaryProfile?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSalaryProfile(profile: SalaryProfile)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(profiles: List<SalaryProfile>)
}

@Dao
interface InvoiceDao {
    @Query("SELECT * FROM invoices ORDER BY year DESC, month DESC, id DESC")
    fun getAllInvoices(): Flow<List<Invoice>>

    @Query("SELECT * FROM invoices ORDER BY year DESC, month DESC, id DESC")
    suspend fun getAllInvoicesDirect(): List<Invoice>

    @Query("SELECT * FROM invoices WHERE userId = :userId ORDER BY year DESC, month DESC")
    fun getInvoicesForUser(userId: Long): Flow<List<Invoice>>

    @Query("SELECT * FROM invoices WHERE id = :invoiceId LIMIT 1")
    suspend fun getInvoiceById(invoiceId: Long): Invoice?

    @Query("SELECT * FROM invoices WHERE userId = :userId AND month = :month AND year = :year LIMIT 1")
    suspend fun getInvoiceForMonth(userId: Long, month: Int, year: Int): Invoice?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInvoice(invoice: Invoice): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(invoices: List<Invoice>)

    @Update
    suspend fun updateInvoice(invoice: Invoice)

    @Delete
    suspend fun deleteInvoice(invoice: Invoice)

    @Query("DELETE FROM invoices WHERE month = :month AND year = :year")
    suspend fun deleteBatch(month: Int, year: Int)
}

@Dao
interface PayrollRuleDao {
    @Query("SELECT * FROM payroll_rules WHERE id = 1 LIMIT 1")
    suspend fun getPayrollRuleEntity(): PayrollRuleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(entity: PayrollRuleEntity)
}
