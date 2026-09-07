package com.attendease.ui.screens.employee

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.attendease.data.models.AttendanceRecord
import com.attendease.data.models.User
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.components.KpiCard
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@Composable
fun EmployeeDashboardScreen(
    user: User,
    viewModel: MainViewModel,
    onNavigate: (String) -> Unit
) {
    val attendanceList by viewModel.attendance.collectAsState()
    val todayStr = remember { LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) }
    val currentMonthStr = remember { LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")) }

    // User's attendance records
    val userAttendance = remember(attendanceList, user.id) {
        attendanceList.filter { it.userId == user.id }
    }

    val todayRecord = remember(userAttendance, todayStr) {
        userAttendance.find { it.date == todayStr }
    }

    // Monthly stats
    val monthlyRecords = remember(userAttendance, currentMonthStr) {
        userAttendance.filter { it.date.startsWith(currentMonthStr) }
    }

    val workingDays = remember { PayrollEngine.countWorkingDays(LocalDate.now().year, LocalDate.now().monthValue) }
    val presentCount = remember(monthlyRecords) { monthlyRecords.count { it.status == "present" || it.status == "late" } }
    val lateCount = remember(monthlyRecords) { monthlyRecords.count { it.status == "late" } }
    val absentCount = remember(workingDays, presentCount) { Math.max(0, workingDays - presentCount) }
    val totalHours = remember(monthlyRecords) {
        monthlyRecords.sumOf { it.hoursWorked ?: 0.0 }
    }
    val attendanceRate = remember(workingDays, presentCount) {
        if (workingDays > 0) ((presentCount.toDouble() / workingDays) * 100).toInt() else 100
    }

    val recentRecords = remember(userAttendance) {
        userAttendance.take(10)
    }

    val greeting = remember {
        val hour = LocalTime.now().hour
        when {
            hour < 12 -> "Good Morning"
            hour < 17 -> "Good Afternoon"
            else -> "Good Evening"
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Greeting & Check-In Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CheckInCardGradient, RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            Text(
                                text = "$greeting, ${user.firstName}!",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "${user.position} • ${user.department}",
                                fontSize = 12.sp,
                                color = PurpleLight.copy(alpha = 0.8f)
                            )
                        }

                        // Live status indicator
                        val (dotColor, statusText) = when {
                            todayRecord?.checkOut != null -> Pair(PurpleLight, "Completed")
                            todayRecord?.checkIn != null -> Pair(Success, "Checked In")
                            else -> Pair(Warning, "Ready")
                        }

                        Surface(
                            color = Color.White.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(dotColor, CircleShape)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = statusText,
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Check-in Strip
                    Surface(
                        color = Color.Black.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceAround,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Check In", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = todayRecord?.checkIn ?: "--:--",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Divider(
                                color = Color.White.copy(alpha = 0.2f),
                                modifier = Modifier
                                    .height(28.dp)
                                    .width(1.dp)
                            )
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Check Out", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = todayRecord?.checkOut ?: "--:--",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Divider(
                                color = Color.White.copy(alpha = 0.2f),
                                modifier = Modifier
                                    .height(28.dp)
                                    .width(1.dp)
                            )
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Hours", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = if (todayRecord?.hoursWorked != null) "${todayRecord.hoursWorked}h" else "--",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Action Button
                    when {
                        todayRecord?.checkIn == null -> {
                            Button(
                                onClick = { viewModel.checkIn(user.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = Success),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp)
                            ) {
                                Icon(Icons.Default.Login, contentDescription = null, tint = Color.White)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Check In Now", fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                        todayRecord.checkOut == null -> {
                            Button(
                                onClick = { viewModel.checkOut(user.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = Danger),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp)
                            ) {
                                Icon(Icons.Default.Logout, contentDescription = null, tint = Color.White)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Check Out", fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                        else -> {
                            Surface(
                                color = Color.White.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(10.dp)
                                ) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SuccessLight)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Attendance Complete for Today",
                                        color = Color.White,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 13.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Section Title: Monthly Stats
        item {
            Text(
                text = "MONTHLY ATTENDANCE SUMMARY",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted
            )
        }

        // KPI Grid (2x3 on mobile)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    KpiCard(
                        title = "Working Days",
                        value = "$workingDays",
                        subtitle = "This month",
                        icon = Icons.Default.CalendarToday,
                        accentColor = Primary,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Days Present",
                        value = "$presentCount",
                        subtitle = "${workingDays - absentCount} logged",
                        icon = Icons.Default.CheckCircle,
                        accentColor = Success,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    KpiCard(
                        title = "Days Late",
                        value = "$lateCount",
                        subtitle = "Grace: 2 days",
                        icon = Icons.Default.AccessTime,
                        accentColor = Warning,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Days Absent",
                        value = "$absentCount",
                        subtitle = "LOP impact",
                        icon = Icons.Default.Cancel,
                        accentColor = Danger,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    KpiCard(
                        title = "Total Hours",
                        value = "${String.format("%.1f", totalHours)}h",
                        subtitle = "Logged this month",
                        icon = Icons.Default.HourglassTop,
                        accentColor = Purple,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Attendance Rate",
                        value = "$attendanceRate%",
                        subtitle = if (attendanceRate >= 90) "Excellent" else "Attention needed",
                        icon = Icons.Default.TrendingUp,
                        accentColor = if (attendanceRate >= 90) Success else Warning,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Quick Actions
        item {
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedButton(
                    onClick = { onNavigate("employee_leaves") },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(46.dp)
                ) {
                    Icon(Icons.Default.EventBusy, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Request Leave", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                }

                OutlinedButton(
                    onClick = { onNavigate("employee_attendance") },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(46.dp)
                ) {
                    Icon(Icons.Default.History, contentDescription = null, tint = Primary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Full History", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                }
            }
        }

        // Section Title: Recent Attendance
        item {
            Text(
                text = "RECENT ATTENDANCE LOGS",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted
            )
        }

        if (recentRecords.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("No attendance logs found.", color = TextMuted, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(recentRecords) { rec ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.padding(14.dp)
                    ) {
                        Column {
                            Text(
                                text = rec.date,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "In: ${rec.checkIn ?: "--"} | Out: ${rec.checkOut ?: "--"} (${if (rec.hoursWorked != null) "${rec.hoursWorked}h" else "--"})",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        }

                        StatusBadge(status = rec.status)
                    }
                }
            }
        }
    }
}
