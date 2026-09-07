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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.attendease.data.models.AttendanceRecord
import com.attendease.data.models.User
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminAttendanceScreen(
    viewModel: MainViewModel
) {
    val users by viewModel.users.collectAsState()
    val allRecords by viewModel.attendance.collectAsState()

    var selectedUserId by remember { mutableStateOf<Long?>(null) }
    var selectedStatus by remember { mutableStateOf("All") }
    var editingRecord by remember { mutableStateOf<AttendanceRecord?>(null) }
    var showEditDialog by remember { mutableStateOf(false) }

    val filteredRecords = remember(allRecords, selectedUserId, selectedStatus) {
        allRecords.filter { rec ->
            (selectedUserId == null || rec.userId == selectedUserId) &&
            (selectedStatus == "All" || rec.status.equals(selectedStatus, ignoreCase = true))
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
                text = "Attendance Records & Logs",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Search, review and adjust employee time tracking logs",
                fontSize = 13.sp,
                color = TextMuted
            )
        }

        // Filters Card
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("FILTER BY EMPLOYEE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                    Spacer(modifier = Modifier.height(8.dp))

                    ScrollableTabRow(
                        selectedTabIndex = if (selectedUserId == null) 0 else (users.indexOfFirst { it.id == selectedUserId } + 1).coerceAtLeast(0),
                        edgePadding = 0.dp,
                        containerColor = Color.Transparent,
                        divider = {},
                        indicator = {}
                    ) {
                        Surface(
                            color = if (selectedUserId == null) Primary else SurfaceSecondary,
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (selectedUserId == null) Primary else Border),
                            modifier = Modifier
                                .padding(end = 6.dp)
                                .clickable { selectedUserId = null }
                        ) {
                            Text(
                                text = "All Staff",
                                color = if (selectedUserId == null) Color.White else TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }

                        users.filter { it.role == "employee" }.forEach { emp ->
                            val isSelected = selectedUserId == emp.id
                            Surface(
                                color = if (isSelected) Primary else SurfaceSecondary,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .clickable { selectedUserId = emp.id }
                            ) {
                                Text(
                                    text = emp.fullName,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Status filter
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("All", "Present", "Late", "Absent").forEach { st ->
                            val isSelected = selectedStatus == st
                            Surface(
                                color = if (isSelected) Purple else SurfaceSecondary,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Purple else Border),
                                modifier = Modifier.clickable { selectedStatus = st }
                            ) {
                                Text(
                                    text = st,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "LOG RECORDS (${filteredRecords.size})",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted
            )
        }

        if (filteredRecords.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("No attendance logs match the current filter.", color = TextMuted, fontSize = 14.sp)
                    }
                }
            }
        } else {
            items(filteredRecords) { rec ->
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
                                    .size(38.dp)
                                    .background(AvatarGradient, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(emp?.initials ?: "E", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(emp?.fullName ?: "Employee", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                                Text(
                                    text = "${rec.date} • In: ${rec.checkIn ?: "--"} | Out: ${rec.checkOut ?: "--"} (${if (rec.hoursWorked != null) "${rec.hoursWorked}h" else "--"})",
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            StatusBadge(status = rec.status)
                            Spacer(modifier = Modifier.width(6.dp))
                            IconButton(
                                onClick = {
                                    editingRecord = rec
                                    showEditDialog = true
                                },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = "Edit Record", tint = Primary, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }
    }

    // Edit Attendance Dialog
    if (showEditDialog && editingRecord != null) {
        val rec = editingRecord!!
        var checkInStr by remember { mutableStateOf(rec.checkIn ?: "09:00") }
        var checkOutStr by remember { mutableStateOf(rec.checkOut ?: "17:30") }
        var statusStr by remember { mutableStateOf(rec.status) }

        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text("Edit Attendance Record", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Date: ${rec.date}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)

                    OutlinedTextField(
                        value = checkInStr,
                        onValueChange = { checkInStr = it },
                        label = { Text("Check-In Time (HH:mm)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = checkOutStr,
                        onValueChange = { checkOutStr = it },
                        label = { Text("Check-Out Time (HH:mm)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text("Status:", fontSize = 12.sp, color = TextMuted)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("present", "late", "absent").forEach { st ->
                            val isSelected = statusStr == st
                            Surface(
                                color = if (isSelected) Primary else SurfaceSecondary,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                modifier = Modifier.clickable { statusStr = st }
                            ) {
                                Text(
                                    text = st.replaceFirstChar { it.uppercase() },
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val updated = rec.copy(
                            checkIn = checkInStr.ifBlank { null },
                            checkOut = checkOutStr.ifBlank { null },
                            status = statusStr
                        )
                        viewModel.updateAttendanceRecord(updated) {
                            showEditDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text("Save Changes")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
