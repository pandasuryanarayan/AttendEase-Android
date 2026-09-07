package com.attendease

import android.app.Application
import com.attendease.data.repository.AttendEaseRepository

class AttendEaseApp : Application() {
    lateinit var repository: AttendEaseRepository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = AttendEaseRepository(this)
    }
}
