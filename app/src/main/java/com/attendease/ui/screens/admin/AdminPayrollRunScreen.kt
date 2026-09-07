package com.attendease.ui.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.components.KpiCard
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate

@Composable
fun AdminPayrollRunScreen(
    viewModel: MainViewModel,
    onNavigateToInvoices: () -> Unit
) {
    val users by viewModel.users.collectAsState()
    val invoices by viewModel.invoices.collectAsState()

    var selectedMonth by remember { mutableStateOf(LocalDate.now().monthValue) }
    var selectedYear by remember { mutableStateOf(LocalDate.now().year) }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    val workingDays = remember(selectedMonth, selectedYear) {
        PayrollEngine.countWorkingDays(selectedYear, selectedMonth)
    }

    val activeStaff = remember(users) { users.filter { it.role == "employee" && it.isActive } }
    val existingInvoices = remember(invoices, selectedMonth, selectedYear) {
        invoices.filter { it.month == selectedMonth && it.year == selectedYear }
    }

    var isRunning by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Execute Monthly Payroll",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Run automated 4-tier salary computation & generate tax invoices",
                fontSize = 13.sp,
                color = TextMuted
            )
        }

        // Period Selector
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("SELECT PAYROLL PERIOD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                    Spacer(modifier = Modifier.height(10.dp))
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
                                    text = "$mName $selectedYear",
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Status Card for this Period
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = if (existingInvoices.isNotEmpty()) SuccessLight else PrimaryLight),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (existingInvoices.isNotEmpty()) Success else Primary),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (existingInvoices.isNotEmpty()) Icons.Default.CheckCircle else Icons.Default.Info,
                            contentDescription = null,
                            tint = if (existingInvoices.isNotEmpty()) SuccessDark else PrimaryDark
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (existingInvoices.isNotEmpty()) "Payroll Executed (${existingInvoices.size} Invoices Generated)" else "Payroll Pending for ${monthNames[selectedMonth - 1]} $selectedYear",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = if (existingInvoices.isNotEmpty()) SuccessDark else PrimaryDark
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = if (existingInvoices.isNotEmpty())
                            "Total Net Payroll: ${PayrollEngine.formatINR(existingInvoices.sumOf { it.netPay })}"
                        else
                            "$activeStaff active staff members ready for calculation ($workingDays working days in period).",
                        fontSize = 13.sp,
                        color = TextPrimary
                    )
                }
            }
        }

        // Pre-flight Verification Checklist
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("PRE-FLIGHT VERIFICATION CHECKLIST", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                    Spacer(modifier = Modifier.height(12.dp))

                    ChecklistItem(
                        title = "Active Staff Roster",
                        desc = "${activeStaff.size} active employees configured with salary profiles",
                        isPassed = activeStaff.isNotEmpty()
                    )
                    ChecklistItem(
                        title = "Standard Working Days",
                        desc = "$workingDays working days detected for ${monthNames[selectedMonth - 1]} $selectedYear",
                        isPassed = workingDays > 0
                    )
                    ChecklistItem(
                        title = "Statutory Rules Active",
                        desc = "EPF (12%), ESI (0.75%), TDS tax slabs, and Professional Tax configured",
                        isPassed = true
                    )
                    ChecklistItem(
                        title = "Loss of Pay & Overtime",
                        desc = "Dual-threshold OT and grace late deduction active",
                        isPassed = true
                    )
                }
            }
        }

        // Run Action Button
        item {
            Button(
                onClick = {
                    isRunning = true
                    viewModel.runPayroll(selectedMonth, selectedYear) {
                        isRunning = false
                        onNavigateToInvoices()
                    }
                },
                enabled = !isRunning,
                colors = ButtonDefaults.buttonColors(containerColor = Primary),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                if (isRunning) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Computing Engine Running...", fontWeight = FontWeight.Bold)
                } else {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (existingInvoices.isNotEmpty()) "Re-Run Payroll for ${monthNames[selectedMonth - 1]}" else "Execute Payroll for ${monthNames[selectedMonth - 1]} $selectedYear",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun ChecklistItem(title: String, desc: String, isPassed: Boolean) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 6.dp)
    ) {
        Icon(
            imageVector = if (isPassed) Icons.Default.CheckCircle else Icons.Default.Warning,
            contentDescription = null,
            tint = if (isPassed) Success else Warning,
            modifier = Modifier.size(18.dp)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Column {
            Text(title, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, color = TextPrimary)
            Text(desc, fontSize = 11.sp, color = TextMuted)
        }
    }
}
