package com.attendease.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.attendease.data.models.*

@Database(
    entities = [
        User::class,
        AttendanceRecord::class,
        LeaveRequest::class,
        SalaryProfile::class,
        Invoice::class,
        PayrollRuleEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun attendanceDao(): AttendanceDao
    abstract fun leaveDao(): LeaveDao
    abstract fun salaryDao(): SalaryDao
    abstract fun invoiceDao(): InvoiceDao
    abstract fun payrollRuleDao(): PayrollRuleDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "attendease_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
