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
import com.attendease.data.models.Invoice
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.components.KpiCard
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminInvoicesScreen(
    viewModel: MainViewModel,
    onViewInvoice: (Long) -> Unit
) {
    val users by viewModel.users.collectAsState()
    val allInvoices by viewModel.invoices.collectAsState()

    var selectedMonth by remember { mutableStateOf(LocalDate.now().monthValue) }
    var selectedYear by remember { mutableStateOf(LocalDate.now().year) }
    var selectedStatus by remember { mutableStateOf("All") }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

    val filteredInvoices = remember(allInvoices, selectedMonth, selectedYear, selectedStatus) {
        allInvoices.filter { inv ->
            inv.month == selectedMonth &&
            inv.year == selectedYear &&
            (selectedStatus == "All" || inv.status.equals(selectedStatus, ignoreCase = true))
        }
    }

    // 4 KPI Summary
    val totalNet = remember(filteredInvoices) { filteredInvoices.sumOf { it.netPay } }
    val paidCount = remember(filteredInvoices) { filteredInvoices.count { it.status == "paid" } }
    val totalOt = remember(filteredInvoices) { filteredInvoices.sumOf { it.overtimePay } }
    val totalTds = remember(filteredInvoices) { filteredInvoices.sumOf { it.tdsTax } }

    // Modals
    var payingInvoice by remember { mutableStateOf<Invoice?>(null) }
    var showPayModal by remember { mutableStateOf(false) }

    var showDeleteBatchModal by remember { mutableStateOf(false) }

    Scaffold { paddingValues ->
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
                            text = "Salary Invoices & Register",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Manage payroll disbursements and tax certificates",
                            fontSize = 13.sp,
                            color = TextMuted
                        )
                    }

                    if (filteredInvoices.isNotEmpty()) {
                        OutlinedButton(
                            onClick = { showDeleteBatchModal = true },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Danger),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(Icons.Default.DeleteForever, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Delete Batch", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
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
                        Text("SELECT PERIOD & STATUS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
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
                                        text = "$mName $selectedYear",
                                        color = if (isSelected) Color.White else TextPrimary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("All", "Paid", "Pending").forEach { st ->
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

            // 4 KPI Summary
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                        KpiCard(
                            title = "Total Net Payroll",
                            value = PayrollEngine.formatINR(totalNet),
                            subtitle = "${filteredInvoices.size} Invoices",
                            icon = Icons.Default.Payments,
                            accentColor = Primary,
                            modifier = Modifier.weight(1f)
                        )
                        KpiCard(
                            title = "Settled Invoices",
                            value = "$paidCount / ${filteredInvoices.size}",
                            subtitle = "Disbursed",
                            icon = Icons.Default.CheckCircle,
                            accentColor = Success,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                        KpiCard(
                            title = "Overtime Paid",
                            value = PayrollEngine.formatINR(totalOt),
                            subtitle = "OT Premium",
                            icon = Icons.Default.AccessTime,
                            accentColor = Purple,
                            modifier = Modifier.weight(1f)
                        )
                        KpiCard(
                            title = "TDS Withheld",
                            value = PayrollEngine.formatINR(totalTds),
                            subtitle = "Statutory Tax",
                            icon = Icons.Default.Receipt,
                            accentColor = Danger,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            item {
                Text(
                    text = "INVOICE DISBURSEMENT REGISTERS (${filteredInvoices.size})",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = TextMuted
                )
            }

            if (filteredInvoices.isEmpty()) {
                item {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Surface),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("No invoices found for ${monthNames[selectedMonth - 1]} $selectedYear. Please run payroll.", color = TextMuted, fontSize = 14.sp)
                        }
                    }
                }
            } else {
                items(filteredInvoices) { inv ->
                    val emp = users.find { it.id == inv.userId }

                    Card(
                        shape = RoundedCornerShape(12.dp),
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
                                        Text(inv.invoiceNumber, fontSize = 12.sp, color = TextMuted)
                                    }
                                }

                                StatusBadge(status = inv.status)
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column {
                                    Text("Gross", fontSize = 11.sp, color = TextLight)
                                    Text(PayrollEngine.formatINR(inv.grossEarnings), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                                }
                                Column {
                                    Text("Deductions", fontSize = 11.sp, color = TextLight)
                                    Text(PayrollEngine.formatINR(inv.totalDeductions), fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Danger)
                                }
                                Column {
                                    Text("Net Pay", fontSize = 11.sp, color = TextLight)
                                    Text(PayrollEngine.formatINR(inv.netPay), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SuccessDark)
                                }
                            }

                            if (inv.status == "paid") {
                                Spacer(modifier = Modifier.height(8.dp))
                                Surface(
                                    color = Background,
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "Paid via ${inv.paymentMode} • Ref: ${inv.transactionRef} on ${inv.paidAt}",
                                        fontSize = 11.sp,
                                        color = TextMuted,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Action buttons
                            Row(
                                horizontalArrangement = Arrangement.End,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (inv.status != "paid") {
                                    Button(
                                        onClick = {
                                            payingInvoice = inv
                                            showPayModal = true
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = Success),
                                        shape = RoundedCornerShape(6.dp),
                                        modifier = Modifier.height(34.dp)
                                    ) {
                                        Icon(Icons.Default.Payment, contentDescription = null, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Mark Paid", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                }

                                OutlinedButton(
                                    onClick = { onViewInvoice(inv.id) },
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.height(34.dp)
                                ) {
                                    Icon(Icons.Default.Receipt, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("View Invoice", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Settle / Mark Paid Modal
    if (showPayModal && payingInvoice != null) {
        val inv = payingInvoice!!
        var paymentMode by remember { mutableStateOf("NEFT") }
        var txnRef by remember { mutableStateOf("TXN" + (10000000..99999999).random()) }
        var payDate by remember { mutableStateOf(LocalDate.now().toString()) }

        val modes = listOf("NEFT", "IMPS", "UPI", "CHEQUE", "CASH")

        AlertDialog(
            onDismissRequest = { showPayModal = false },
            title = { Text("Settle Invoice Payment", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Invoice: ${inv.invoiceNumber}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text("Net Payout Amount: ${PayrollEngine.formatINR(inv.netPay)}", color = SuccessDark, fontWeight = FontWeight.Bold, fontSize = 15.sp)

                    Text("Select Payment Mode:", fontSize = 12.sp, color = TextMuted)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        modes.forEach { m ->
                            val isSelected = paymentMode == m
                            Surface(
                                color = if (isSelected) Primary else SurfaceSecondary,
                                shape = RoundedCornerShape(6.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                modifier = Modifier.clickable { paymentMode = m }
                            ) {
                                Text(
                                    text = m,
                                    color = if (isSelected) Color.White else TextPrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = txnRef,
                        onValueChange = { txnRef = it },
                        label = { Text("Transaction Reference ID") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = payDate,
                        onValueChange = { payDate = it },
                        label = { Text("Payment Date") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.markInvoicePaid(inv, paymentMode, txnRef, payDate) {
                            showPayModal = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Success)
                ) {
                    Text("Confirm Settlement")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPayModal = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Delete Batch Captcha Modal
    if (showDeleteBatchModal) {
        val captchaCode = remember { (1000..9999).random().toString() }
        var enteredCaptcha by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showDeleteBatchModal = false },
            title = { Text("Delete Payroll Batch", fontWeight = FontWeight.Bold, color = Danger) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Are you sure you want to delete all invoices for ${monthNames[selectedMonth - 1]} $selectedYear?",
                        fontSize = 13.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "To confirm deletion, enter the 4-digit verification code below:",
                        fontSize = 12.sp,
                        color = TextMuted
                    )

                    Surface(
                        color = Background,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = captchaCode,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 4.sp,
                            color = PrimaryDark,
                            modifier = Modifier.padding(12.dp)
                        )
                    }

                    OutlinedTextField(
                        value = enteredCaptcha,
                        onValueChange = { enteredCaptcha = it },
                        placeholder = { Text("Enter 4-digit code") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (enteredCaptcha.trim() == captchaCode) {
                            viewModel.deleteInvoiceBatch(selectedMonth, selectedYear) {
                                showDeleteBatchModal = false
                            }
                        } else {
                            viewModel.showFlash("Captcha verification code does not match.", "error")
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Danger)
                ) {
                    Text("Delete All Invoices")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteBatchModal = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
