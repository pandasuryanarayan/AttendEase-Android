package com.attendease.ui.screens.admin

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
import com.attendease.data.models.User
import com.attendease.ui.components.KpiCard
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Composable
fun AdminDashboardScreen(
    user: User,
    viewModel: MainViewModel,
    onNavigate: (String) -> Unit
) {
    val users by viewModel.users.collectAsState()
    val attendanceList by viewModel.attendance.collectAsState()
    val leaves by viewModel.leaves.collectAsState()

    val employees = remember(users) { users.filter { it.role == "employee" && it.isActive } }
    val todayStr = remember { LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) }

    val todayRecords = remember(attendanceList, todayStr) {
        attendanceList.filter { it.date == todayStr }
    }

    val presentToday = remember(todayRecords) {
        todayRecords.count { it.status == "present" || it.status == "late" }
    }

    val onLeaveToday = remember(leaves, todayStr) {
        leaves.count { l ->
            l.status == "approved" &&
            l.startDate <= todayStr &&
            l.endDate >= todayStr
        }
    }

    val absentToday = remember(employees, presentToday, onLeaveToday) {
        Math.max(0, employees.size - presentToday - onLeaveToday)
    }

    val pendingLeavesCount = remember(leaves) {
        leaves.count { it.status == "pending" }
    }

    // 7-day attendance data for chart
    val last7DaysData = remember(attendanceList, employees.size) {
        val list = mutableListOf<Triple<String, Int, Int>>()
        val today = LocalDate.now()
        for (i in 6 downTo 0) {
            val d = today.minusDays(i.toLong())
            val dStr = d.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val dayName = d.format(DateTimeFormatter.ofPattern("EEE"))
            val recs = attendanceList.filter { it.date == dStr }
            val pres = recs.count { it.status == "present" || it.status == "late" }
            val abs = Math.max(0, employees.size - pres)
            list.add(Triple(dayName, pres, abs))
        }
        list
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Header
        item {
            Column {
                Text(
                    text = "Executive Overview",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Real-time workforce attendance & operations telemetry",
                    fontSize = 13.sp,
                    color = TextMuted
                )
            }
        }

        // Pending Leave Alert Banner
        if (pendingLeavesCount > 0) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = WarningLight),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Warning.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.padding(14.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = WarningDark)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "$pendingLeavesCount leave request(s) awaiting administrative review.",
                                color = WarningDark,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                        Button(
                            onClick = { onNavigate("admin_leaves") },
                            colors = ButtonDefaults.buttonColors(containerColor = WarningDark),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("Review", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
        }

        // 4 KPI Cards
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    KpiCard(
                        title = "Total Employees",
                        value = "${employees.size}",
                        subtitle = "Active Staff",
                        icon = Icons.Default.People,
                        accentColor = Primary,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Present Today",
                        value = "$presentToday",
                        subtitle = if (employees.isNotEmpty()) "${(presentToday * 100 / employees.size)}% Rate" else "0%",
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
                        title = "Absent Today",
                        value = "$absentToday",
                        subtitle = "Unaccounted",
                        icon = Icons.Default.Cancel,
                        accentColor = Danger,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "On Leave",
                        value = "$onLeaveToday",
                        subtitle = "Approved Time-Off",
                        icon = Icons.Default.EventBusy,
                        accentColor = Info,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 7-Day Attendance Trend Chart
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "7-Day Attendance Trend",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).background(Success, CircleShape))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Present", fontSize = 11.sp, color = TextMuted)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).background(Danger, CircleShape))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Absent", fontSize = 11.sp, color = TextMuted)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bar visualization
                    Row(
                        horizontalArrangement = Arrangement.SpaceAround,
                        verticalAlignment = Alignment.Bottom,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(110.dp)
                    ) {
                        val maxStaff = Math.max(1, employees.size)
                        last7DaysData.forEach { (dayName, pres, abs) ->
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                                modifier = Modifier.weight(1f)
                            ) {
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(3.dp),
                                    verticalAlignment = Alignment.Bottom,
                                    modifier = Modifier.height(80.dp)
                                ) {
                                    // Present Bar
                                    val presHeight = (pres.toFloat() / maxStaff * 70).dp
                                    Box(
                                        modifier = Modifier
                                            .width(10.dp)
                                            .height(presHeight.coerceAtLeast(4.dp))
                                            .background(Success, RoundedCornerShape(topStart = 3.dp, topEnd = 3.dp))
                                    )
                                    // Absent Bar
                                    val absHeight = (abs.toFloat() / maxStaff * 70).dp
                                    Box(
                                        modifier = Modifier
                                            .width(10.dp)
                                            .height(absHeight.coerceAtLeast(4.dp))
                                            .background(Danger.copy(alpha = 0.8f), RoundedCornerShape(topStart = 3.dp, topEnd = 3.dp))
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(text = dayName, fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }
        }

        // Quick Navigation Grid
        item {
            Text(
                text = "ADMINISTRATIVE MODULES",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    AdminNavCard(
                        title = "Employees",
                        subtitle = "Manage staff directory",
                        icon = Icons.Default.People,
                        color = Primary,
                        onClick = { onNavigate("admin_employees") },
                        modifier = Modifier.weight(1f)
                    )
                    AdminNavCard(
                        title = "Attendance Logs",
                        subtitle = "Review & edit records",
                        icon = Icons.Default.AccessTime,
                        color = Info,
                        onClick = { onNavigate("admin_attendance") },
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    AdminNavCard(
                        title = "Run Payroll",
                        subtitle = "Generate monthly slips",
                        icon = Icons.Default.Payment,
                        color = Success,
                        onClick = { onNavigate("admin_payroll_run") },
                        modifier = Modifier.weight(1f)
                    )
                    AdminNavCard(
                        title = "Salary Invoices",
                        subtitle = "Register & payment settle",
                        icon = Icons.Default.ReceiptLong,
                        color = Purple,
                        onClick = { onNavigate("admin_invoices") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Today's Check-ins List
        item {
            Text(
                text = "TODAY'S LOGGED CHECK-INS",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted
            )
        }

        if (todayRecords.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                        Text("No employee check-ins logged yet today.", color = TextMuted, fontSize = 13.sp)
                    }
                }
            }
        } else {
            items(todayRecords) { rec ->
                val emp = users.find { it.id == rec.userId }
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(AvatarGradient, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = emp?.initials ?: "E",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = emp?.fullName ?: "Employee",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "${emp?.department ?: "General"} • In: ${rec.checkIn ?: "--"} | Out: ${rec.checkOut ?: "--"}",
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        StatusBadge(status = rec.status)
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminNavCard(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier.clickable { onClick() }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .background(color.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                Text(subtitle, fontSize = 11.sp, color = TextMuted)
            }
        }
    }
}
