package com.attendease.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.attendease.data.models.User
import com.attendease.ui.components.AppDrawerContent
import com.attendease.ui.components.AppTopBar
import com.attendease.ui.components.FlashAlert
import com.attendease.ui.screens.admin.*
import com.attendease.ui.screens.auth.LoginScreen
import com.attendease.ui.screens.auth.RegisterScreen
import com.attendease.ui.screens.employee.*
import com.attendease.ui.screens.invoice.InvoiceDetailScreen
import com.attendease.ui.theme.Background
import com.attendease.ui.viewmodels.MainViewModel
import kotlinx.coroutines.launch

@Composable
fun MainAppContent(viewModel: MainViewModel) {
    val currentUser by viewModel.currentUser.collectAsState()
    val flashMessage by viewModel.flashMessage.collectAsState()

    var authScreen by remember { mutableStateOf("login") } // "login" or "register"
    var currentRoute by remember(currentUser) {
        mutableStateOf(if (currentUser?.role == "admin") "admin_dashboard" else "employee_dashboard")
    }
    var selectedInvoiceId by remember { mutableStateOf<Long?>(null) }

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    if (currentUser == null) {
        Box(modifier = Modifier.fillMaxSize()) {
            if (authScreen == "login") {
                LoginScreen(
                    viewModel = viewModel,
                    onNavigateToRegister = { authScreen = "register" },
                    onLoginSuccess = { /* state triggers recomposition */ }
                )
            } else {
                RegisterScreen(
                    viewModel = viewModel,
                    onNavigateToLogin = { authScreen = "login" }
                )
            }

            // Flash overlay on Auth screens
            FlashAlert(
                flash = flashMessage,
                onDismiss = { viewModel.clearFlash() }
            )
        }
    } else {
        // App with Navigation Drawer
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                ModalDrawerSheet(drawerContainerColor = androidx.compose.ui.graphics.Color.Transparent) {
                    AppDrawerContent(
                        currentUser = currentUser,
                        currentRoute = currentRoute,
                        onNavigate = { route ->
                            currentRoute = route
                            selectedInvoiceId = null
                            scope.launch { drawerState.close() }
                        },
                        onSignOut = {
                            viewModel.logout {
                                authScreen = "login"
                            }
                            scope.launch { drawerState.close() }
                        }
                    )
                }
            }
        ) {
            val user = currentUser!!
            val screenTitle = when {
                selectedInvoiceId != null -> "Payslip Certificate"
                currentRoute == "admin_dashboard" -> "Admin Overview"
                currentRoute == "admin_employees" -> "Employee Directory"
                currentRoute == "admin_attendance" -> "Attendance Logs"
                currentRoute == "admin_leaves" -> "Leave Management"
                currentRoute == "admin_reports" -> "Workforce Analytics"
                currentRoute == "admin_payroll_run" -> "Execute Payroll"
                currentRoute == "admin_invoices" -> "Salary Invoices"
                currentRoute == "admin_payroll_settings" -> "Payroll Policy & Rules"
                currentRoute == "employee_dashboard" -> "My Dashboard"
                currentRoute == "employee_attendance" -> "My Attendance"
                currentRoute == "employee_leaves" -> "My Leaves"
                currentRoute == "employee_payslips" -> "My Payslips"
                else -> "AttendEase"
            }

            Scaffold(
                topBar = {
                    if (selectedInvoiceId == null) {
                        AppTopBar(
                            title = screenTitle,
                            onMenuClick = {
                                scope.launch {
                                    if (drawerState.isClosed) drawerState.open() else drawerState.close()
                                }
                            },
                            onSignOutClick = {
                                viewModel.logout {
                                    authScreen = "login"
                                }
                            }
                        )
                    }
                },
                containerColor = Background
            ) { paddingValues ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    // Flash alerts
                    FlashAlert(
                        flash = flashMessage,
                        onDismiss = { viewModel.clearFlash() }
                    )

                    // Body
                    Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                        when {
                            selectedInvoiceId != null -> {
                                InvoiceDetailScreen(
                                    invoiceId = selectedInvoiceId!!,
                                    viewModel = viewModel,
                                    onBack = { selectedInvoiceId = null }
                                )
                            }
                            // Admin Screens
                            currentRoute == "admin_dashboard" -> {
                                AdminDashboardScreen(
                                    user = user,
                                    viewModel = viewModel,
                                    onNavigate = { route -> currentRoute = route }
                                )
                            }
                            currentRoute == "admin_employees" -> {
                                AdminEmployeesScreen(viewModel = viewModel)
                            }
                            currentRoute == "admin_attendance" -> {
                                AdminAttendanceScreen(viewModel = viewModel)
                            }
                            currentRoute == "admin_leaves" -> {
                                AdminLeavesScreen(viewModel = viewModel)
                            }
                            currentRoute == "admin_reports" -> {
                                AdminReportsScreen(viewModel = viewModel)
                            }
                            currentRoute == "admin_payroll_run" -> {
                                AdminPayrollRunScreen(
                                    viewModel = viewModel,
                                    onNavigateToInvoices = { currentRoute = "admin_invoices" }
                                )
                            }
                            currentRoute == "admin_invoices" -> {
                                AdminInvoicesScreen(
                                    viewModel = viewModel,
                                    onViewInvoice = { id -> selectedInvoiceId = id }
                                )
                            }
                            currentRoute == "admin_payroll_settings" -> {
                                AdminPayrollSettingsScreen(viewModel = viewModel)
                            }
                            // Employee Screens
                            currentRoute == "employee_dashboard" -> {
                                EmployeeDashboardScreen(
                                    user = user,
                                    viewModel = viewModel,
                                    onNavigate = { route -> currentRoute = route }
                                )
                            }
                            currentRoute == "employee_attendance" -> {
                                EmployeeAttendanceScreen(
                                    user = user,
                                    viewModel = viewModel
                                )
                            }
                            currentRoute == "employee_leaves" -> {
                                EmployeeLeavesScreen(
                                    user = user,
                                    viewModel = viewModel
                                )
                            }
                            currentRoute == "employee_payslips" -> {
                                EmployeePayslipsScreen(
                                    user = user,
                                    viewModel = viewModel,
                                    onViewInvoice = { id -> selectedInvoiceId = id }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
