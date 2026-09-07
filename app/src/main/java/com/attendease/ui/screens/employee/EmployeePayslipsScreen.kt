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
import com.attendease.data.models.Invoice
import com.attendease.data.models.User
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.components.KpiCard
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel

@Composable
fun EmployeePayslipsScreen(
    user: User,
    viewModel: MainViewModel,
    onViewInvoice: (Long) -> Unit
) {
    val allInvoices by viewModel.invoices.collectAsState()
    val userInvoices = remember(allInvoices, user.id) {
        allInvoices.filter { it.userId == user.id }
    }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

    // YTD Stats
    val ytdGross = remember(userInvoices) { userInvoices.sumOf { it.grossEarnings } }
    val ytdNet = remember(userInvoices) { userInvoices.sumOf { it.netPay } }
    val ytdTax = remember(userInvoices) { userInvoices.sumOf { it.tdsTax + it.professionalTax } }
    val ytdOt = remember(userInvoices) { userInvoices.sumOf { it.overtimePay } }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "My Salary Payslips",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "View official tax invoices and salary disbursements",
                fontSize = 13.sp,
                color = TextMuted
            )
        }

        // 4 KPI Summary Cards
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    KpiCard(
                        title = "YTD Gross",
                        value = PayrollEngine.formatINR(ytdGross),
                        subtitle = "Total Earnings",
                        icon = Icons.Default.AccountBalanceWallet,
                        accentColor = Primary,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "YTD Net Payout",
                        value = PayrollEngine.formatINR(ytdNet),
                        subtitle = "Disbursed",
                        icon = Icons.Default.Payments,
                        accentColor = Success,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    KpiCard(
                        title = "YTD Tax Withheld",
                        value = PayrollEngine.formatINR(ytdTax),
                        subtitle = "TDS & PT Deducted",
                        icon = Icons.Default.Receipt,
                        accentColor = Danger,
                        modifier = Modifier.weight(1f)
                    )
                    KpiCard(
                        title = "YTD Overtime",
                        value = PayrollEngine.formatINR(ytdOt),
                        subtitle = "OT Premium",
                        icon = Icons.Default.AccessTime,
                        accentColor = Purple,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        item {
            Text(
                text = "PAYSLIP DISBURSEMENT HISTORY",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                color = TextMuted,
                modifier = Modifier.padding(top = 6.dp)
            )
        }

        if (userInvoices.isEmpty()) {
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
                        Text("No payslips available yet.", color = TextMuted, fontSize = 14.sp)
                    }
                }
            }
        } else {
            items(userInvoices) { inv ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onViewInvoice(inv.id) }
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text(
                                    text = "${monthNames.getOrElse(inv.month - 1) { "Month ${inv.month}" }} ${inv.year}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = TextPrimary
                                )
                                Text(
                                    text = inv.invoiceNumber,
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }

                            StatusBadge(status = inv.status)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text("Gross Earnings", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = PayrollEngine.formatINR(inv.grossEarnings),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )
                            }
                            Column {
                                Text("Deductions", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = PayrollEngine.formatINR(inv.totalDeductions),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Danger
                                )
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Net Pay", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = PayrollEngine.formatINR(inv.netPay),
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = SuccessDark
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            horizontalArrangement = Arrangement.End,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Button(
                                onClick = { onViewInvoice(inv.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight, contentColor = PrimaryDark),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("View Payslip Certificate", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
