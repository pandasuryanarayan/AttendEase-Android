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
import com.attendease.data.models.LeaveRequest
import com.attendease.data.models.User
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeLeavesScreen(
    user: User,
    viewModel: MainViewModel
) {
    val allLeaves by viewModel.leaves.collectAsState()
    val userLeaves = remember(allLeaves, user.id) {
        allLeaves.filter { it.userId == user.id }
    }

    var showNewLeaveDialog by remember { mutableStateOf(false) }

    // Dialog state
    var leaveType by remember { mutableStateOf("vacation") }
    var startDate by remember { mutableStateOf(LocalDate.now().plusDays(1).toString()) }
    var endDate by remember { mutableStateOf(LocalDate.now().plusDays(2).toString()) }
    var reason by remember { mutableStateOf("") }
    val leaveTypes = listOf("vacation" to "Vacation", "sick" to "Sick Leave", "personal" to "Personal", "other" to "Other")

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showNewLeaveDialog = true },
                containerColor = Primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Leave Request")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        Text(
                            text = "Leave Applications",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Track and submit your time-off requests",
                            fontSize = 13.sp,
                            color = TextMuted
                        )
                    }

                    Button(
                        onClick = { showNewLeaveDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Apply Leave", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            if (userLeaves.isEmpty()) {
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
                            Text("No leave requests found.", color = TextMuted, fontSize = 14.sp)
                        }
                    }
                }
            } else {
                items(userLeaves) { leave ->
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
                                    val typeColor = when (leave.leaveType.lowercase()) {
                                        "vacation" -> Primary
                                        "sick" -> Success
                                        "personal" -> Purple
                                        else -> Warning
                                    }
                                    Surface(
                                        color = typeColor.copy(alpha = 0.12f),
                                        shape = RoundedCornerShape(6.dp)
                                    ) {
                                        Text(
                                            text = leave.leaveType.replaceFirstChar { it.uppercase() },
                                            color = typeColor,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "${leave.daysRequested} Day(s)",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary
                                    )
                                }

                                StatusBadge(status = leave.status)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "Period: ${leave.startDate} to ${leave.endDate}",
                                fontSize = 13.sp,
                                color = TextPrimary,
                                fontWeight = FontWeight.Medium
                            )

                            if (leave.reason.isNotBlank()) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Reason: ${leave.reason}",
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }

                            if (leave.adminNote.isNotBlank()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Surface(
                                    color = Background,
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "Admin Note: ${leave.adminNote}",
                                        fontSize = 12.sp,
                                        color = TextMuted,
                                        modifier = Modifier.padding(8.dp)
                                    )
                                }
                            }

                            if (leave.status == "pending") {
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    horizontalArrangement = Arrangement.End,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    OutlinedButton(
                                        onClick = { viewModel.cancelLeaveRequest(leave) },
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Danger),
                                        shape = RoundedCornerShape(6.dp),
                                        modifier = Modifier.height(32.dp)
                                    ) {
                                        Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Cancel Request", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Submit Leave Dialog
    if (showNewLeaveDialog) {
        AlertDialog(
            onDismissRequest = { showNewLeaveDialog = false },
            title = { Text("New Leave Application", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Select Leave Type:", fontSize = 12.sp, color = TextMuted)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        leaveTypes.forEach { (typeKey, label) ->
                            val isSelected = leaveType == typeKey
                            Surface(
                                color = if (isSelected) Primary else SurfaceSecondary,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                modifier = Modifier.clickable { leaveType = typeKey }
                            ) {
                                Text(
                                    text = label,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = startDate,
                        onValueChange = { startDate = it },
                        label = { Text("Start Date (YYYY-MM-DD)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = endDate,
                        onValueChange = { endDate = it },
                        label = { Text("End Date (YYYY-MM-DD)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = reason,
                        onValueChange = { reason = it },
                        label = { Text("Reason for Leave") },
                        minLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (startDate.isBlank() || endDate.isBlank()) {
                            viewModel.showFlash("Please specify start and end dates.", "warning")
                        } else {
                            viewModel.submitLeaveRequest(
                                userId = user.id,
                                type = leaveType,
                                startDate = startDate,
                                endDate = endDate,
                                reason = reason,
                                onSuccess = { showNewLeaveDialog = false }
                            )
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text("Submit Application")
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewLeaveDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
