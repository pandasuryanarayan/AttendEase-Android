package com.attendease.ui.screens.invoice

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.attendease.data.models.CustomLineItem
import com.attendease.data.models.Invoice
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.components.StatusBadge
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvoiceDetailScreen(
    invoiceId: Long,
    viewModel: MainViewModel,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val invoices by viewModel.invoices.collectAsState()
    val users by viewModel.users.collectAsState()
    val rules by viewModel.payrollRules.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    val invoice = remember(invoices, invoiceId) {
        invoices.find { it.id == invoiceId }
    }

    val employee = remember(users, invoice) {
        users.find { it.id == invoice?.userId }
    }

    val customItems = remember(invoice?.customLineItemsJson) {
        try {
            val listType = object : TypeToken<List<CustomLineItem>>() {}.type
            Gson().fromJson<List<CustomLineItem>>(invoice?.customLineItemsJson ?: "[]", listType) ?: emptyList()
        } catch (e: Exception) {
            emptyList<CustomLineItem>()
        }
    }

    val monthNames = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

    var showAddLineItemModal by remember { mutableStateOf(false) }
    var showPayModal by remember { mutableStateOf(false) }

    if (invoice == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Invoice not found.", color = TextMuted)
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Payslip Certificate", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            val shareText = """
                                ========================================
                                ${rules.company.companyName.uppercase()} - SALARY PAYSLIP
                                ========================================
                                Invoice: ${invoice.invoiceNumber}
                                Period: ${monthNames.getOrElse(invoice.month - 1) { "Month ${invoice.month}" }} ${invoice.year}
                                Employee: ${employee?.fullName} (${employee?.email})
                                Department: ${employee?.department} | ${employee?.position}
                                ----------------------------------------
                                Gross Earnings: ${PayrollEngine.formatINR(invoice.grossEarnings)}
                                Total Deductions: ${PayrollEngine.formatINR(invoice.totalDeductions)}
                                NET PAYABLE: ${PayrollEngine.formatINR(invoice.netPay)}
                                Status: ${invoice.status.uppercase()}
                                Paid via: ${invoice.paymentMode} | Ref: ${invoice.transactionRef}
                                ========================================
                            """.trimIndent()

                            val sendIntent: Intent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, shareText)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Payslip Certificate"))
                        }
                    ) {
                        Icon(Icons.Default.Share, contentDescription = "Share Payslip")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Certificate Container Card (A4 Style)
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        // Header
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text(
                                    text = rules.company.companyName,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = rules.company.address,
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                                Text(
                                    text = "GSTIN: ${rules.company.gstin}",
                                    fontSize = 11.sp,
                                    color = TextLight
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .background(BrandLogoGradient, RoundedCornerShape(10.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.CalendarToday, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
                            }
                        }

                        Divider(color = Border, thickness = 1.dp, modifier = Modifier.padding(vertical = 14.dp))

                        // Invoice & Period Details
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text("INVOICE NUMBER", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextLight)
                                Text(invoice.invoiceNumber, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PrimaryDark)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("PAY PERIOD", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = TextLight)
                                Text("${monthNames.getOrElse(invoice.month - 1) { "M${invoice.month}" }} ${invoice.year}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Employee Info Box
                        Surface(
                            color = Background,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text("Employee: ${employee?.fullName ?: "Staff"}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                    StatusBadge(status = invoice.status)
                                }
                                Text("Role: ${employee?.position ?: ""} • Dept: ${employee?.department ?: ""}", fontSize = 12.sp, color = TextMuted)
                                Text("Email: ${employee?.email ?: ""}", fontSize = 12.sp, color = TextMuted)
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Attendance Summary Strip
                        Surface(
                            color = PrimaryLight.copy(alpha = 0.5f),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Primary.copy(alpha = 0.2f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.SpaceAround,
                                modifier = Modifier.padding(10.dp)
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Working", fontSize = 10.sp, color = TextMuted)
                                    Text("${invoice.workingDays}d", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Present", fontSize = 10.sp, color = TextMuted)
                                    Text("${invoice.presentDays}d", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SuccessDark)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("Lates", fontSize = 10.sp, color = TextMuted)
                                    Text("${invoice.lateDays}d", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = WarningDark)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("OT Hours", fontSize = 10.sp, color = TextMuted)
                                    Text("${invoice.overtimeHours}h", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Purple)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("LOP Days", fontSize = 10.sp, color = TextMuted)
                                    Text("${invoice.absentDays}d", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Danger)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Earnings Section
                        Text("EARNINGS BREAKDOWN", fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = PrimaryDark)
                        Spacer(modifier = Modifier.height(6.dp))

                        BreakdownRow("Basic Salary (${invoice.basicPercentage}%)", invoice.basicPay)
                        BreakdownRow("House Rent Allowance (HRA ${invoice.hraPercentage}%)", invoice.hra)
                        BreakdownRow("Conveyance Allowance", invoice.conveyanceAllowance)
                        BreakdownRow("Medical Allowance", invoice.medicalAllowance)
                        BreakdownRow("Special Allowance", invoice.specialAllowance)
                        if (invoice.overtimePay > 0) {
                            BreakdownRow("Overtime Premium (${invoice.overtimeHours} hrs)", invoice.overtimePay, color = Purple)
                        }

                        // Custom Earnings
                        customItems.filter { it.type == "earning" }.forEach { item ->
                            BreakdownRow(item.label, item.amount, color = SuccessDark)
                        }

                        Divider(color = Border, modifier = Modifier.padding(vertical = 6.dp))
                        BreakdownRow("Gross Earnings", invoice.grossEarnings, isBold = true)

                        Spacer(modifier = Modifier.height(14.dp))

                        // Deductions Section
                        Text("DEDUCTIONS & TAXES", fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = DangerDark)
                        Spacer(modifier = Modifier.height(6.dp))

                        if (invoice.pfDeduction > 0) BreakdownRow("Provident Fund (PF ${invoice.pfPercentage}%)", invoice.pfDeduction)
                        if (invoice.professionalTax > 0) BreakdownRow("Professional Tax (PT)", invoice.professionalTax)
                        if (invoice.tdsTax > 0) BreakdownRow("TDS Income Tax Withheld (${invoice.tdsPercentage}%)", invoice.tdsTax)
                        if (invoice.lateDeduction > 0) BreakdownRow("Late Arrival Deduction", invoice.lateDeduction, color = Danger)
                        if (invoice.lopDeduction > 0) BreakdownRow("Loss of Pay (LOP) Deduction", invoice.lopDeduction, color = Danger)

                        // Custom Deductions
                        customItems.filter { it.type == "deduction" }.forEach { item ->
                            BreakdownRow(item.label, item.amount, color = Danger)
                        }

                        Divider(color = Border, modifier = Modifier.padding(vertical = 6.dp))
                        BreakdownRow("Total Deductions", invoice.totalDeductions, isBold = true, color = Danger)

                        Spacer(modifier = Modifier.height(18.dp))

                        // Net Pay Hero Banner
                        Surface(
                            color = Color.Transparent,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(NetPayBannerGradient, RoundedCornerShape(12.dp))
                        ) {
                            Column(
                                modifier = Modifier.padding(18.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("TOTAL NET PAYABLE DISBURSEMENT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PurpleLight.copy(alpha = 0.8f))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = PayrollEngine.formatINR(invoice.netPay),
                                    fontSize = 26.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = if (invoice.status == "paid") "Settled via ${invoice.paymentMode} (Ref: ${invoice.transactionRef}) on ${invoice.paidAt}" else "Pending disbursement settlement",
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Signatory Note
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text("System Generated Document", fontSize = 10.sp, color = TextLight)
                                Text("Computer verified on ${invoice.createdAt}", fontSize = 10.sp, color = TextLight)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Authorized Signatory", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                                Text(rules.company.signatoryTitle, fontSize = 10.sp, color = TextMuted)
                            }
                        }
                    }
                }
            }

            // Admin Actions (Add Line Item, Settle Payment)
            if (currentUser?.role == "admin") {
                item {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedButton(
                            onClick = { showAddLineItemModal = true },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.AddCircleOutline, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add Line Item", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        if (invoice.status != "paid") {
                            Button(
                                onClick = { showPayModal = true },
                                colors = ButtonDefaults.buttonColors(containerColor = Success),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Payment, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Settle & Mark Paid", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }

    // Add Line Item Modal
    if (showAddLineItemModal) {
        var labelStr by remember { mutableStateOf("") }
        var amountStr by remember { mutableStateOf("") }
        var itemType by remember { mutableStateOf("earning") }

        AlertDialog(
            onDismissRequest = { showAddLineItemModal = false },
            title = { Text("Add Custom Line Item", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Type:", fontSize = 12.sp, color = TextMuted)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Surface(
                            color = if (itemType == "earning") Success else SurfaceSecondary,
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.clickable { itemType = "earning" }
                        ) {
                            Text("Earning / Bonus", color = if (itemType == "earning") Color.White else TextPrimary, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                        }
                        Surface(
                            color = if (itemType == "deduction") Danger else SurfaceSecondary,
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.clickable { itemType = "deduction" }
                        ) {
                            Text("Deduction / Penalty", color = if (itemType == "deduction") Color.White else TextPrimary, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                        }
                    }

                    OutlinedTextField(
                        value = labelStr,
                        onValueChange = { labelStr = it },
                        label = { Text("Line Item Label (e.g. Performance Bonus)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = amountStr,
                        onValueChange = { amountStr = it },
                        label = { Text("Amount (₹)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amt = amountStr.toDoubleOrNull() ?: 0.0
                        if (labelStr.isNotBlank() && amt > 0) {
                            viewModel.addInvoiceCustomLineItem(invoice, labelStr, amt, itemType) {
                                showAddLineItemModal = false
                            }
                        } else {
                            viewModel.showFlash("Please enter a valid label and amount.", "warning")
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text("Add to Payslip")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddLineItemModal = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Settle Modal
    if (showPayModal) {
        var paymentMode by remember { mutableStateOf("NEFT") }
        var txnRef by remember { mutableStateOf("TXN" + (10000000..99999999).random()) }
        var payDate by remember { mutableStateOf(LocalDate.now().toString()) }

        val modes = listOf("NEFT", "IMPS", "UPI", "CHEQUE", "CASH")

        AlertDialog(
            onDismissRequest = { showPayModal = false },
            title = { Text("Settle Invoice Payment", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Invoice: ${invoice.invoiceNumber}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text("Net Payout Amount: ${PayrollEngine.formatINR(invoice.netPay)}", color = SuccessDark, fontWeight = FontWeight.Bold, fontSize = 15.sp)

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
                        viewModel.markInvoicePaid(invoice, paymentMode, txnRef, payDate) {
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
}

@Composable
private fun BreakdownRow(
    label: String,
    amount: Double,
    isBold: Boolean = false,
    color: Color = TextPrimary
) {
    Row(
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp)
    ) {
        Text(
            text = label,
            fontSize = if (isBold) 13.sp else 12.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
            color = if (isBold) TextPrimary else TextMuted
        )
        Text(
            text = PayrollEngine.formatINR(amount),
            fontSize = if (isBold) 13.sp else 12.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Medium,
            color = color
        )
    }
}
