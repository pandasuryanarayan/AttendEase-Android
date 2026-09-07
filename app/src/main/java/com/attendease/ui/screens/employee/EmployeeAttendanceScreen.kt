package com.attendease.ui.screens.employee

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.attendease.data.models.User
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeAttendanceScreen(
    user: User,
    viewModel: MainViewModel
) {
    val attendanceList by viewModel.attendance.collectAsState()

    var selectedMonth by remember { mutableStateOf(LocalDate.now().monthValue) }
    var selectedYear by remember { mutableStateOf(LocalDate.now().year) }
    var selectedStatus by remember { mutableStateOf("All") }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    val statuses = listOf("All", "Present", "Late", "Absent")

    val filteredRecords = remember(attendanceList, user.id, selectedMonth, selectedYear, selectedStatus) {
        val monthPrefix = "$selectedYear-${selectedMonth.toString().padStart(2, '0')}"
        attendanceList.filter { rec ->
            rec.userId == user.id &&
            rec.date.startsWith(monthPrefix) &&
            (selectedStatus == "All" || rec.status.equals(selectedStatus, ignoreCase = true))
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Filters Card
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "ATTENDANCE FILTERS",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        color = TextMuted
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Month Selector Chips
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
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .clickable { selectedMonth = index + 1 }
                            ) {
                                Text(
                                    text = mName,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Status Chips
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        statuses.forEach { st ->
                            val isSelected = selectedStatus == st
                            Surface(
                                color = if (isSelected) Purple else SurfaceSecondary,
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Purple else Border),
                                modifier = Modifier.clickable { selectedStatus = st }
                            ) {
                                Text(
                                    text = st,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Summary Bar
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Records (${filteredRecords.size})",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${monthNames[selectedMonth - 1]} $selectedYear",
                    fontSize = 13.sp,
                    color = TextMuted
                )
            }
        }

        if (filteredRecords.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No records found for this period.",
                            color = TextMuted,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        } else {
            items(filteredRecords) { rec ->
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
                                text = "In: ${rec.checkIn ?: "--"}   |   Out: ${rec.checkOut ?: "--"}   |   ${if (rec.hoursWorked != null) "${rec.hoursWorked} hrs" else "--"}",
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
