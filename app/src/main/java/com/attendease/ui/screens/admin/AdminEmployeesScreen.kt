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
import com.attendease.data.models.SalaryProfile
import com.attendease.data.models.User
import com.attendease.domain.payroll.PayrollEngine
import com.attendease.ui.theme.*
import com.attendease.ui.viewmodels.MainViewModel
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminEmployeesScreen(
    viewModel: MainViewModel
) {
    val users by viewModel.users.collectAsState()
    val salaries by viewModel.salaryProfiles.collectAsState()
    val rules by viewModel.payrollRules.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedDept by remember { mutableStateOf("All") }

    val departments = listOf("All", "Engineering", "Marketing", "HR", "Finance", "Sales", "Operations", "Management")

    val filteredUsers = remember(users, searchQuery, selectedDept) {
        users.filter { u ->
            val matchesQuery = u.fullName.contains(searchQuery, ignoreCase = true) || u.email.contains(searchQuery, ignoreCase = true)
            val matchesDept = selectedDept == "All" || u.department.equals(selectedDept, ignoreCase = true)
            matchesQuery && matchesDept
        }
    }

    var editingUser by remember { mutableStateOf<User?>(null) }
    var showFormModal by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingUser = null
                    showFormModal = true
                },
                containerColor = Primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = "Add Employee")
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
                            text = "Employee Directory",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "${filteredUsers.size} staff members listed",
                            fontSize = 13.sp,
                            color = TextMuted
                        )
                    }

                    Button(
                        onClick = {
                            editingUser = null
                            showFormModal = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Employee", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            // Search and Department Filter Bar
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = { Text("Search by name, email...") },
                            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        ScrollableTabRow(
                            selectedTabIndex = departments.indexOf(selectedDept).coerceAtLeast(0),
                            edgePadding = 0.dp,
                            containerColor = Color.Transparent,
                            divider = {},
                            indicator = {}
                        ) {
                            departments.forEach { dept ->
                                val isSelected = selectedDept == dept
                                Surface(
                                    color = if (isSelected) Primary else SurfaceSecondary,
                                    shape = RoundedCornerShape(6.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) Primary else Border),
                                    modifier = Modifier
                                        .padding(end = 6.dp)
                                        .clickable { selectedDept = dept }
                                ) {
                                    Text(
                                        text = dept,
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

            // Employee Cards
            items(filteredUsers) { emp ->
                val sal = salaries.find { it.userId == emp.id }
                val empType = rules.employeeTypes.find { it.id == sal?.employeeTypeId }

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
                                        .size(42.dp)
                                        .background(AvatarGradient, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = emp.initials,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = emp.fullName,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp,
                                            color = TextPrimary
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Box(
                                            modifier = Modifier
                                                .size(8.dp)
                                                .background(if (emp.isActive) Success else Danger, CircleShape)
                                        )
                                    }
                                    Text(
                                        text = "${emp.position} • ${emp.department}",
                                        fontSize = 12.sp,
                                        color = TextMuted
                                    )
                                }
                            }

                            Surface(
                                color = if (emp.role == "admin") PurpleLight else PrimaryLight,
                                shape = RoundedCornerShape(6.dp)
                            ) {
                                Text(
                                    text = emp.role.uppercase(),
                                    color = if (emp.role == "admin") Purple else PrimaryDark,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Divider(color = Border)

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text("Email", fontSize = 11.sp, color = TextLight)
                                Text(emp.email, fontSize = 12.sp, color = TextPrimary)
                            }
                            Column {
                                Text("Base CTC", fontSize = 11.sp, color = TextLight)
                                Text(
                                    text = PayrollEngine.formatINR(sal?.baseSalary ?: 65000.0),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = SuccessDark
                                )
                            }
                            Column {
                                Text("Category Profile", fontSize = 11.sp, color = TextLight)
                                Text(empType?.name?.take(15) ?: "Standard", fontSize = 12.sp, color = TextMuted)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Actions
                        Row(
                            horizontalArrangement = Arrangement.End,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            OutlinedButton(
                                onClick = {
                                    editingUser = emp
                                    showFormModal = true
                                },
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Edit", fontSize = 11.sp)
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            OutlinedButton(
                                onClick = { viewModel.toggleUserActive(emp) },
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text(if (emp.isActive) "Deactivate" else "Activate", fontSize = 11.sp)
                            }

                            if (emp.id != 1L) {
                                Spacer(modifier = Modifier.width(8.dp))
                                OutlinedButton(
                                    onClick = { viewModel.deleteEmployee(emp) },
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Danger),
                                    shape = RoundedCornerShape(6.dp),
                                    modifier = Modifier.height(32.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(13.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Add / Edit Modal Form
    if (showFormModal) {
        val isEdit = editingUser != null
        var fName by remember { mutableStateOf(editingUser?.firstName ?: "") }
        var lName by remember { mutableStateOf(editingUser?.lastName ?: "") }
        var emailStr by remember { mutableStateOf(editingUser?.email ?: "") }
        var phoneStr by remember { mutableStateOf(editingUser?.phone ?: "") }
        var deptStr by remember { mutableStateOf(editingUser?.department ?: "Engineering") }
        var posStr by remember { mutableStateOf(editingUser?.position ?: "") }
        var passStr by remember { mutableStateOf(if (isEdit) "" else "employee123") }
        val currentSal = salaries.find { it.userId == editingUser?.id }
        var baseSalStr by remember { mutableStateOf((currentSal?.baseSalary?.toInt() ?: 65000).toString()) }
        var catId by remember { mutableStateOf(currentSal?.employeeTypeId ?: "full_time_senior") }

        AlertDialog(
            onDismissRequest = { showFormModal = false },
            title = { Text(if (isEdit) "Edit Employee" else "Add New Employee", fontWeight = FontWeight.Bold) },
            text = {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = fName,
                                onValueChange = { fName = it },
                                label = { Text("First Name") },
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = lName,
                                onValueChange = { lName = it },
                                label = { Text("Last Name") },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                    item {
                        OutlinedTextField(
                            value = emailStr,
                            onValueChange = { emailStr = it },
                            label = { Text("Email Address") },
                            enabled = !isEdit,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = phoneStr,
                            onValueChange = { phoneStr = it },
                            label = { Text("Phone") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = deptStr,
                            onValueChange = { deptStr = it },
                            label = { Text("Department") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = posStr,
                            onValueChange = { posStr = it },
                            label = { Text("Position") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = baseSalStr,
                            onValueChange = { baseSalStr = it },
                            label = { Text("Base Salary CTC (₹)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = passStr,
                            onValueChange = { passStr = it },
                            label = { Text(if (isEdit) "Change Password (optional)" else "Password") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (fName.isBlank() || emailStr.isBlank()) {
                            viewModel.showFlash("Name and email are required.", "warning")
                        } else {
                            val userObj = User(
                                id = editingUser?.id ?: 0L,
                                firstName = fName.trim(),
                                lastName = lName.trim(),
                                email = emailStr.trim(),
                                passwordHash = if (passStr.isNotBlank()) passStr.trim() else (editingUser?.passwordHash ?: "employee123"),
                                role = editingUser?.role ?: "employee",
                                department = deptStr.trim(),
                                position = posStr.trim(),
                                phone = phoneStr.trim(),
                                hireDate = editingUser?.hireDate ?: LocalDate.now().toString(),
                                isActive = editingUser?.isActive ?: true,
                                createdAt = editingUser?.createdAt ?: LocalDate.now().toString()
                            )
                            val salNum = baseSalStr.toDoubleOrNull() ?: 65000.0
                            viewModel.addOrUpdateEmployee(userObj, salNum, catId) {
                                showFormModal = false
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text("Save Employee")
                }
            },
            dismissButton = {
                TextButton(onClick = { showFormModal = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
