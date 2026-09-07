package com.attendease.ui.screens.admin

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
import com.attendease.data.models.*
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel

@Composable
fun AdminPayrollSettingsScreen(
    viewModel: MainViewModel
) {
    val currentRules by viewModel.payrollRules.collectAsState()

    var rulesState by remember(currentRules) { mutableStateOf(currentRules) }
    var selectedTab by remember { mutableStateOf(0) }

    val tabs = listOf(
        "Salary Structure",
        "Deductions & Taxes",
        "Attendance & OT",
        "Priority Cascade",
        "Category Profiles",
        "Simulation",
        "Branding"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 10.dp)
                ) {
                    Text(
                        text = "Payroll Rules & Settings",
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Customize 4-tier engine, statutory taxes & policy rules",
                        fontSize = 12.sp,
                        color = TextMuted,
                        lineHeight = 16.sp
                    )
                }

                Button(
                    onClick = { viewModel.updatePayrollRules(rulesState) },
                    colors = ButtonDefaults.buttonColors(containerColor = Success),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                    modifier = Modifier.defaultMinSize(minHeight = 36.dp)
                ) {
                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Save", fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                }
            }
        }

        // Horizontal Scrollable Tab Bar
        item {
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                edgePadding = 0.dp,
                containerColor = Color.Transparent,
                divider = {},
                indicator = {}
            ) {
                tabs.forEachIndexed { index, label ->
                    val isSelected = selectedTab == index
                    Surface(
                        color = if (isSelected) Primary else SurfaceSecondary,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                        modifier = Modifier
                            .padding(end = 6.dp)
                            .clickable { selectedTab = index }
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) Color.White else TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // Tab Content
        when (selectedTab) {
            0 -> item { TabSalaryStructure(rulesState) { rulesState = it } }
            1 -> item { TabDeductionsAndTaxes(rulesState) { rulesState = it } }
            2 -> item { TabAttendanceAndOT(rulesState) { rulesState = it } }
            3 -> item { TabPriorityCascade() }
            4 -> item { TabCategoryProfiles(rulesState) }
            5 -> item { TabTestSimulation(rulesState) }
            6 -> item { TabBranding(rulesState) { rulesState = it } }
        }

        item {
            Button(
                onClick = { viewModel.updatePayrollRules(rulesState) },
                colors = ButtonDefaults.buttonColors(containerColor = Success),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Save All Payroll Settings", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun TabSalaryStructure(
    rules: PayrollRules,
    onChange: (PayrollRules) -> Unit
) {
    var basicPct by remember(rules) { mutableStateOf(rules.salaryStructure.basicPercentage.toString()) }
    var hraPct by remember(rules) { mutableStateOf(rules.salaryStructure.hraPercentage.toString()) }
    var convAmt by remember(rules) { mutableStateOf(rules.salaryStructure.conveyanceAllowance.toString()) }
    var medAmt by remember(rules) { mutableStateOf(rules.salaryStructure.medicalAllowance.toString()) }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("CTC Component Percentages & Allowances", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("These components form the basis of the gross salary calculation.", fontSize = 12.sp, color = TextMuted)

            OutlinedTextField(
                value = basicPct,
                onValueChange = {
                    basicPct = it
                    val num = it.toDoubleOrNull() ?: 50.0
                    val updated = rules.salaryStructure.copy(basicPercentage = num)
                    onChange(rules.copy(salaryStructure = updated))
                },
                label = { Text("Basic Salary (%)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = hraPct,
                onValueChange = {
                    hraPct = it
                    val num = it.toDoubleOrNull() ?: 40.0
                    val updated = rules.salaryStructure.copy(hraPercentage = num)
                    onChange(rules.copy(salaryStructure = updated))
                },
                label = { Text("House Rent Allowance HRA (%)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = convAmt,
                onValueChange = {
                    convAmt = it
                    val num = it.toDoubleOrNull() ?: 2000.0
                    val updated = rules.salaryStructure.copy(conveyanceAllowance = num)
                    onChange(rules.copy(salaryStructure = updated))
                },
                label = { Text("Conveyance Allowance (₹ Flat Monthly)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = medAmt,
                onValueChange = {
                    medAmt = it
                    val num = it.toDoubleOrNull() ?: 1500.0
                    val updated = rules.salaryStructure.copy(medicalAllowance = num)
                    onChange(rules.copy(salaryStructure = updated))
                },
                label = { Text("Medical Allowance (₹ Flat Monthly)") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun TabDeductionsAndTaxes(
    rules: PayrollRules,
    onChange: (PayrollRules) -> Unit
) {
    var pfEnabled by remember(rules) { mutableStateOf(rules.deductionsConfig.pfEnabled) }
    var pfRate by remember(rules) { mutableStateOf(rules.deductionsConfig.pfRate.toString()) }
    var tdsEnabled by remember(rules) { mutableStateOf(rules.deductionsConfig.tdsEnabled) }
    var tdsRate by remember(rules) { mutableStateOf(rules.deductionsConfig.tdsRate.toString()) }
    var ptEnabled by remember(rules) { mutableStateOf(rules.deductionsConfig.ptEnabled) }
    var ptFlat by remember(rules) { mutableStateOf(rules.deductionsConfig.ptFlatAmount.toString()) }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Statutory Deductions & Taxes", fontWeight = FontWeight.Bold, fontSize = 14.sp)

            // EPF / PF Row
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column {
                    Text("Provident Fund (PF / EPF)", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text("Deduction on Basic salary", fontSize = 11.sp, color = TextMuted)
                }
                Switch(
                    checked = pfEnabled,
                    onCheckedChange = {
                        pfEnabled = it
                        val updated = rules.deductionsConfig.copy(pfEnabled = it)
                        onChange(rules.copy(deductionsConfig = updated))
                    }
                )
            }
            if (pfEnabled) {
                OutlinedTextField(
                    value = pfRate,
                    onValueChange = {
                        pfRate = it
                        val num = it.toDoubleOrNull() ?: 6.0
                        val updated = rules.deductionsConfig.copy(pfRate = num)
                        onChange(rules.copy(deductionsConfig = updated))
                    },
                    label = { Text("PF Employee Rate (%)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Divider(color = Border)

            // TDS Income Tax Row
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column {
                    Text("TDS Income Tax Withholding", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text("Tax withheld on estimated gross", fontSize = 11.sp, color = TextMuted)
                }
                Switch(
                    checked = tdsEnabled,
                    onCheckedChange = {
                        tdsEnabled = it
                        val updated = rules.deductionsConfig.copy(tdsEnabled = it)
                        onChange(rules.copy(deductionsConfig = updated))
                    }
                )
            }
            if (tdsEnabled) {
                OutlinedTextField(
                    value = tdsRate,
                    onValueChange = {
                        tdsRate = it
                        val num = it.toDoubleOrNull() ?: 10.0
                        val updated = rules.deductionsConfig.copy(tdsRate = num)
                        onChange(rules.copy(deductionsConfig = updated))
                    },
                    label = { Text("TDS Tax Rate (%)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Divider(color = Border)

            // PT Row
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column {
                    Text("Professional Tax (PT)", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text("State government statutory monthly tax", fontSize = 11.sp, color = TextMuted)
                }
                Switch(
                    checked = ptEnabled,
                    onCheckedChange = {
                        ptEnabled = it
                        val updated = rules.deductionsConfig.copy(ptEnabled = it)
                        onChange(rules.copy(deductionsConfig = updated))
                    }
                )
            }
            if (ptEnabled) {
                OutlinedTextField(
                    value = ptFlat,
                    onValueChange = {
                        ptFlat = it
                        val num = it.toDoubleOrNull() ?: 200.0
                        val updated = rules.deductionsConfig.copy(ptFlatAmount = num)
                        onChange(rules.copy(deductionsConfig = updated))
                    },
                    label = { Text("Monthly PT (₹)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

@Composable
private fun TabAttendanceAndOT(
    rules: PayrollRules,
    onChange: (PayrollRules) -> Unit
) {
    var otEnabled by remember(rules) { mutableStateOf(rules.overtimeConfig.enabled) }
    var dailyThreshold by remember(rules) { mutableStateOf(rules.overtimeConfig.dailyThreshold.toString()) }
    var otMult by remember(rules) { mutableStateOf(rules.overtimeConfig.standardMultiplier.toString()) }
    var lateGrace by remember(rules) { mutableStateOf(rules.attendanceLopConfig.lateGraceCount.toString()) }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Overtime & Loss of Pay (LOP) Rules", fontWeight = FontWeight.Bold, fontSize = 14.sp)

            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column {
                    Text("Overtime Engine", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text("Calculate OT premium on excess daily hours", fontSize = 11.sp, color = TextMuted)
                }
                Switch(
                    checked = otEnabled,
                    onCheckedChange = {
                        otEnabled = it
                        val updated = rules.overtimeConfig.copy(enabled = it)
                        onChange(rules.copy(overtimeConfig = updated))
                    }
                )
            }

            if (otEnabled) {
                OutlinedTextField(
                    value = dailyThreshold,
                    onValueChange = {
                        dailyThreshold = it
                        val num = it.toDoubleOrNull() ?: 8.0
                        val updated = rules.overtimeConfig.copy(dailyThreshold = num)
                        onChange(rules.copy(overtimeConfig = updated))
                    },
                    label = { Text("Daily OT Threshold (Hours)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = otMult,
                    onValueChange = {
                        otMult = it
                        val num = it.toDoubleOrNull() ?: 1.5
                        val updated = rules.overtimeConfig.copy(standardMultiplier = num)
                        onChange(rules.copy(overtimeConfig = updated))
                    },
                    label = { Text("OT Rate Multiplier (e.g. 1.5x)") },
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Divider(color = Border)

            Text("Late Arrival Penalties", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
            OutlinedTextField(
                value = lateGrace,
                onValueChange = {
                    lateGrace = it
                    val num = it.toIntOrNull() ?: 2
                    val updated = rules.attendanceLopConfig.copy(lateGraceCount = num)
                    onChange(rules.copy(attendanceLopConfig = updated))
                },
                label = { Text("Late Grace Days per Month") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun TabPriorityCascade() {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("4-Tier Priority Cascade Architecture", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("The payroll engine evaluates salary rules in strict descending priority order:", fontSize = 12.sp, color = TextMuted)

            Surface(color = PrimaryLight, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("1. Employee-Level Override (Highest)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = PrimaryDark)
                    Text("Custom individual base salary CTC assigned to specific user.", fontSize = 11.sp, color = TextPrimary)
                }
            }

            Surface(color = PurpleLight, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("2. Category / Role Profile", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Purple)
                    Text("Rules & base ranges defined by employee classification (Full-time, Intern, Contractor).", fontSize = 11.sp, color = TextPrimary)
                }
            }

            Surface(color = InfoLight, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("3. Department Default", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Info)
                    Text("Department-specific standard compensation policies.", fontSize = 11.sp, color = TextPrimary)
                }
            }

            Surface(color = SurfaceSecondary, shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text("4. Global System Policy (Base)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                    Text("Default standard structure applied across the organization.", fontSize = 11.sp, color = TextMuted)
                }
            }
        }
    }
}

@Composable
private fun TabCategoryProfiles(rules: PayrollRules) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Configured Employee Category Profiles", fontWeight = FontWeight.Bold, fontSize = 14.sp)

            rules.employeeTypes.forEach { type ->
                Surface(
                    color = SurfaceSecondary,
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Border),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(type.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                            Text(PayrollEngine.formatINR(type.baseSalary), fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SuccessDark)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${type.description} • Custom Allowance: ${PayrollEngine.formatINR(type.customAllowance)} (${type.customAllowanceLabel})",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TabTestSimulation(rules: PayrollRules) {
    var simBaseCtc by remember { mutableStateOf("65000") }
    val baseVal = simBaseCtc.toDoubleOrNull() ?: 65000.0

    val basic = baseVal * (rules.salaryStructure.basicPercentage / 100.0)
    val hra = baseVal * (rules.salaryStructure.hraPercentage / 100.0)
    val conv = rules.salaryStructure.conveyanceAllowance
    val med = rules.salaryStructure.medicalAllowance
    val gross = basic + hra + conv + med
    val pf = if (rules.deductionsConfig.pfEnabled) basic * (rules.deductionsConfig.pfRate / 100.0) else 0.0
    val tds = if (rules.deductionsConfig.tdsEnabled) gross * (rules.deductionsConfig.tdsRate / 100.0) else 0.0
    val pt = if (rules.deductionsConfig.ptEnabled) rules.deductionsConfig.ptFlatAmount else 0.0
    val totalDed = pf + tds + pt
    val net = Math.max(0.0, gross - totalDed)

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Interactive Payroll Engine Simulator", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("Test calculation outcomes instantly with dynamic base salary.", fontSize = 12.sp, color = TextMuted)

            OutlinedTextField(
                value = simBaseCtc,
                onValueChange = { simBaseCtc = it },
                label = { Text("Base Salary CTC (₹)") },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(6.dp))

            Surface(
                color = Background,
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Primary),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("ESTIMATED MONTHLY DISBURSEMENT", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = PrimaryDark)
                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Gross Earnings (Basic + HRA + Allowances):", fontSize = 12.sp, color = TextPrimary)
                        Text(PayrollEngine.formatINR(gross), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Total Deductions (PF + TDS + PT):", fontSize = 12.sp, color = TextPrimary)
                        Text(PayrollEngine.formatINR(totalDed), fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Danger)
                    }
                    Divider(color = Border)
                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Estimated Net Payout:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SuccessDark)
                        Text(PayrollEngine.formatINR(net), fontWeight = FontWeight.Bold, fontSize = 15.sp, color = SuccessDark)
                    }
                }
            }
        }
    }
}

@Composable
private fun TabBranding(
    rules: PayrollRules,
    onChange: (PayrollRules) -> Unit
) {
    var compName by remember(rules) { mutableStateOf(rules.company.companyName) }
    var address by remember(rules) { mutableStateOf(rules.company.address) }
    var gstin by remember(rules) { mutableStateOf(rules.company.gstin) }
    var signTitle by remember(rules) { mutableStateOf(rules.company.signatoryTitle) }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Payslip & Organization Branding", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text("Information rendered on generated payslip certificates.", fontSize = 12.sp, color = TextMuted)

            OutlinedTextField(
                value = compName,
                onValueChange = {
                    compName = it
                    val updated = rules.company.copy(companyName = it)
                    onChange(rules.copy(company = updated))
                },
                label = { Text("Company Name") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = address,
                onValueChange = {
                    address = it
                    val updated = rules.company.copy(address = it)
                    onChange(rules.copy(company = updated))
                },
                label = { Text("Company Address") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = gstin,
                onValueChange = {
                    gstin = it
                    val updated = rules.company.copy(gstin = it)
                    onChange(rules.copy(company = updated))
                },
                label = { Text("GSTIN / Corporate Tax ID") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = signTitle,
                onValueChange = {
                    signTitle = it
                    val updated = rules.company.copy(signatoryTitle = it)
                    onChange(rules.copy(company = updated))
                },
                label = { Text("Signatory Title (e.g. VP Human Resources)") },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
