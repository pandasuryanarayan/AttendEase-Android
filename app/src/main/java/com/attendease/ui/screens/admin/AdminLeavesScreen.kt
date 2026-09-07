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
import com.attendease.data.models.LeaveRequest
import com.attendease.data.models.User
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel

@Composable
fun AdminLeavesScreen(
    viewModel: MainViewModel
) {
    val users by viewModel.users.collectAsState()
    val allLeaves by viewModel.leaves.collectAsState()

    var selectedTab by remember { mutableStateOf("pending") }
    val tabs = listOf("pending" to "Pending", "approved" to "Approved", "rejected" to "Rejected", "all" to "All Requests")

    val filteredLeaves = remember(allLeaves, selectedTab) {
        if (selectedTab == "all") allLeaves else allLeaves.filter { it.status == selectedTab }
    }

    var reviewingLeave by remember { mutableStateOf<LeaveRequest?>(null) }
    var showReviewModal by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "Leave Management",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Review and approve employee time-off requests",
                fontSize = 13.sp,
                color = TextMuted
            )
        }

        // Tabs
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                tabs.forEach { (tabKey, label) ->
                    val isSelected = selectedTab == tabKey
                    Surface(
                        color = if (isSelected) Primary else SurfaceSecondary,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                        modifier = Modifier.clickable { selectedTab = tabKey }
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) Color.White else TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        if (filteredLeaves.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("No leave requests in this category.", color = TextMuted, fontSize = 14.sp)
                    }
                }
            }
        } else {
            items(filteredLeaves) { leave ->
                val emp = users.find { it.id == leave.userId }

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
                                    Text(emp?.initials ?: "E", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(emp?.fullName ?: "Employee", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
                                    Text("${emp?.department ?: "General"} • ${emp?.position ?: ""}", fontSize = 12.sp, color = TextMuted)
                                }
                            }

                            StatusBadge(status = leave.status)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "${leave.leaveType.replaceFirstChar { it.uppercase() }} (${leave.daysRequested} Days)",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                color = PrimaryDark
                            )
                            Text(
                                text = "${leave.startDate} to ${leave.endDate}",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        }

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
                                    fontSize = 11.sp,
                                    color = TextMuted,
                                    modifier = Modifier.padding(8.dp)
                                )
                            }
                        }

                        if (leave.status == "pending") {
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                horizontalArrangement = Arrangement.End,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        reviewingLeave = leave
                                        showReviewModal = true
                                    },
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Icon(Icons.Default.RateReview, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Review Application", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Review Modal
    if (showReviewModal && reviewingLeave != null) {
        val leave = reviewingLeave!!
        val emp = users.find { it.id == leave.userId }
        var adminNoteStr by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showReviewModal = false },
            title = { Text("Review Leave Request", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Employee: ${emp?.fullName} (${emp?.department})",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "Leave: ${leave.leaveType.replaceFirstChar { it.uppercase() }} for ${leave.daysRequested} day(s)",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                    Text(
                        text = "Dates: ${leave.startDate} to ${leave.endDate}",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                    if (leave.reason.isNotBlank()) {
                        Text(
                            text = "Reason: ${leave.reason}",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }

                    OutlinedTextField(
                        value = adminNoteStr,
                        onValueChange = { adminNoteStr = it },
                        label = { Text("Admin Comments / Remarks") },
                        minLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            viewModel.reviewLeaveRequest(leave, approved = true, adminNote = adminNoteStr)
                            showReviewModal = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Success)
                    ) {
                        Text("Approve")
                    }
                    Button(
                        onClick = {
                            viewModel.reviewLeaveRequest(leave, approved = false, adminNote = adminNoteStr)
                            showReviewModal = false
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Danger)
                    ) {
                        Text("Reject")
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { showReviewModal = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
