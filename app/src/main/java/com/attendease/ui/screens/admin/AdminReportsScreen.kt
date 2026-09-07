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
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.components.KpiCard
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate

@Composable
fun AdminReportsScreen(
    viewModel: MainViewModel
) {
    val users by viewModel.users.collectAsState()
    val attendanceList by viewModel.attendance.collectAsState()

    var selectedMonth by remember { mutableStateOf(LocalDate.now().monthValue) }
    var selectedYear by remember { mutableStateOf(LocalDate.now().year) }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    val workingDays = remember(selectedMonth, selectedYear) {
        PayrollEngine.countWorkingDays(selectedYear, selectedMonth)
    }

    val activeStaff = remember(users) { users.filter { it.role == "employee" && it.isActive } }
    val monthPrefix = "$selectedYear-${selectedMonth.toString().padStart(2, '0')}"

    val monthlyRecords = remember(attendanceList, monthPrefix) {
        attendanceList.filter { it.date.startsWith(monthPrefix) }
    }

    // Analytics computation
    val totalHoursSum = remember(monthlyRecords) { monthlyRecords.sumOf { it.hoursWorked ?: 0.0 } }
    val totalPresents = remember(monthlyRecords) { monthlyRecords.count { it.status == "present" || it.status == "late" } }
    val totalAbsences = remember(activeStaff.size, workingDays, totalPresents) {
        Math.max(0, (activeStaff.size * workingDays) - totalPresents)
    }
    val avgAttendanceRate = remember(activeStaff.size, workingDays, totalPresents) {
        val totalExpected = activeStaff.size * workingDays
        if (totalExpected > 0) ((totalPresents.toDouble() / totalExpected) * 100).toInt() else 100
    }

    // Per-employee breakdown
    val employeeBreakdown = remember(activeStaff, monthlyRecords, workingDays) {
        activeStaff.map { emp ->
            val empRecs = monthlyRecords.filter { it.userId == emp.id }
            val pres = empRecs.count { it.status == "present" || it.status == "late" }
            val lates = empRecs.count { it.status == "late" }
            val abs = Math.max(0, workingDays - pres)
            val hrs = empRecs.sumOf { it.hoursWorked ?: 0.0 }
            val rate = if (workingDays > 0) ((pres.toDouble() / workingDays) * 100).toInt() else 100
            EmployeeStat(emp, pres, lates, abs, hrs, rate)
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "Workforce Analytics & Reports",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Comprehensive monthly attendance distribution & metrics",
                fontSize = 13.sp,
                color = TextMuted
            )
        }

        // Month Selector
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("SELECT PERIOD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                    Spacer(modifier = Modifier.height(8.dp))
                    ScrollableTabRow(
                        selectedTabIndex = selectedMonth - 1,
                        edgePadding = 0.dp,
                        containerColor = Color.Transparent,
                        divider = {},
                        indicator = {}
                    ) {
                        monthNames.forEachIndexed { index, mName ->
                            val isSelected = selectedMonth == index + 1
                            Surface(
                                color = if (isSelected) Primary else SurfaceSecondary,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .clickable { selectedMonth = index + 1 }
                            ) {
                                Text(
                                    text = mName,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // 4 KPI Cards
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    KpiCard(
                        title = "Active Staff",
                        value = "${activeStaff.size}",
                        subtitle = "$workingDays working days",
                        icon = Icons.Default.People,
                        accentColor = Primary,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Avg Attendance",
                        value = "$avgAttendanceRate%",
                        subtitle = "Fleet performance",
                        icon = Icons.Default.TrendingUp,
                        accentColor = if (avgAttendanceRate >= 85) Success else Warning,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    KpiCard(
                        title = "Total Hours",
                        value = "${String.format("%.1f", totalHoursSum)}h",
                        subtitle = "Cumulative work",
                        icon = Icons.Default.AccessTime,
                        accentColor = Purple,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "Total Absences",
                        value = "$totalAbsences",
                        subtitle = "Unattended shifts",
                        icon = Icons.Default.Cancel,
                        accentColor = Danger,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        item {
            Text(
                text = "STAFF ATTENDANCE BREAKDOWN",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted
            )
        }

        items(employeeBreakdown) { stat ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .background(AvatarGradient, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(stat.user.initials, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(stat.user.fullName, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                                Text("${stat.user.position} • ${stat.user.department}", fontSize = 12.sp, color = TextMuted)
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("${stat.rate}%", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = if (stat.rate >= 90) SuccessDark else if (stat.rate >= 75) WarningDark else Danger)
                            Text("Attendance", fontSize = 11.sp, color = TextLight)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Progress bar
                    LinearProgressIndicator(
                        progress = { (stat.rate / 100f).coerceIn(0f, 1f) },
                        color = if (stat.rate >= 90) Success else if (stat.rate >= 75) Warning else Danger,
                        trackColor = Border,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Present: ${stat.present}d", fontSize = 12.sp, color = SuccessDark, fontWeight = FontWeight.Medium)
                        Text("Late: ${stat.late}d", fontSize = 12.sp, color = WarningDark, fontWeight = FontWeight.Medium)
                        Text("Absent: ${stat.absent}d", fontSize = 12.sp, color = Danger, fontWeight = FontWeight.Medium)
                        Text("Hours: ${String.format("%.1f", stat.hours)}h", fontSize = 12.sp, color = Purple, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

private data class EmployeeStat(
    val user: com.attendease.data.models.User,
    val present: Int,
    val late: Int,
    val absent: Int,
    val hours: Double,
    val rate: Int
)
