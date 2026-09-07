package com.attendease.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.attendease.data.models.User
import com.attendease.data.repository.AttendEaseRepository
import com.attendease.ui.theme.*
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlinx.coroutines.delay

@Composable
fun StatusBadge(status: String, modifier: Modifier = Modifier) {
    val (bgColor, textColor, dotColor, label) = when (status.lowercase()) {
        "present" -> Quad(SuccessLight, SuccessDark, Success, "Present")
        "late" -> Quad(WarningLight, WarningDark, Warning, "Late")
        "absent" -> Quad(DangerLight, DangerDark, Danger, "Absent")
        "leave" -> Quad(InfoLight, Info, Info, "On Leave")
        "approved" -> Quad(SuccessLight, SuccessDark, Success, "Approved")
        "pending" -> Quad(WarningLight, WarningDark, Warning, "Pending")
        "rejected" -> Quad(DangerLight, DangerDark, Danger, "Rejected")
        "paid" -> Quad(SuccessLight, SuccessDark, Success, "Paid")
        else -> Quad(Background, TextMuted, TextMuted, status.replaceFirstChar { it.uppercase() })
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(20.dp),
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .background(dotColor, CircleShape)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                color = textColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

private data class Quad<A, B, C, D>(val a: A, val b: B, val c: C, val d: D)

@Composable
fun KpiCard(
    title: String,
    value: String,
    subtitle: String? = null,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextMuted
                )
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(accentColor.copy(alpha = 0.12f), RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            if (subtitle != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = TextLight
                )
            }
        }
    }
}

@Composable
fun AppTopBar(
    title: String,
    onMenuClick: () -> Unit,
    onSignOutClick: (() -> Unit)? = null
) {
    val todayDateStr = remember {
        LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM"))
    }

    Surface(
        color = Surface,
        shadowElevation = 3.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f, fill = false)
            ) {
                IconButton(onClick = onMenuClick) {
                    Icon(
                        imageVector = Icons.Default.Menu,
                        contentDescription = "Menu",
                        tint = TextPrimary
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    maxLines = 1
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    color = Background,
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Border)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CalendarMonth,
                            contentDescription = null,
                            tint = Primary,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = todayDateStr,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextMuted
                        )
                    }
                }

                if (onSignOutClick != null) {
                    IconButton(
                        onClick = onSignOutClick,
                        modifier = Modifier
                            .size(36.dp)
                            .background(DangerLight, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Logout,
                            contentDescription = "Sign Out",
                            tint = DangerDark,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AppDrawerContent(
    currentUser: User?,
    currentRoute: String,
    onNavigate: (String) -> Unit,
    onSignOut: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxHeight()
            .width(280.dp)
            .background(SidebarGradient)
            .padding(16.dp)
    ) {
        // Brand Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(vertical = 12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(BrandLogoGradient, RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CalendarToday,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "AttendEase",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "PRO DASHBOARD",
                    color = PurpleLight.copy(alpha = 0.7f),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            }
        }

        Divider(color = DarkBorder, thickness = 1.dp, modifier = Modifier.padding(vertical = 12.dp))

        // Navigation links
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            if (currentUser?.role == "admin") {
                DrawerNavItem("Overview", "admin_dashboard", Icons.Default.Dashboard, currentRoute, onNavigate)
                DrawerNavItem("Employees", "admin_employees", Icons.Default.People, currentRoute, onNavigate)
                DrawerNavItem("Attendance Logs", "admin_attendance", Icons.Default.AccessTime, currentRoute, onNavigate)
                DrawerNavItem("Leave Requests", "admin_leaves", Icons.Default.EventBusy, currentRoute, onNavigate)
                DrawerNavItem("Analytics & Reports", "admin_reports", Icons.Default.BarChart, currentRoute, onNavigate)
                DrawerNavItem("Run Payroll", "admin_payroll_run", Icons.Default.Payment, currentRoute, onNavigate)
                DrawerNavItem("Salary Invoices", "admin_invoices", Icons.Default.ReceiptLong, currentRoute, onNavigate)
                DrawerNavItem("Payroll Rules", "admin_payroll_settings", Icons.Default.Settings, currentRoute, onNavigate)
            } else {
                DrawerNavItem("My Dashboard", "employee_dashboard", Icons.Default.Dashboard, currentRoute, onNavigate)
                DrawerNavItem("Attendance History", "employee_attendance", Icons.Default.AccessTime, currentRoute, onNavigate)
                DrawerNavItem("Leave Requests", "employee_leaves", Icons.Default.EventBusy, currentRoute, onNavigate)
                DrawerNavItem("My Payslips", "employee_payslips", Icons.Default.ReceiptLong, currentRoute, onNavigate)
            }
        }

        // Footer User Profile & Sign Out
        Divider(color = DarkBorder, thickness = 1.dp, modifier = Modifier.padding(vertical = 12.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(AvatarGradient, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = currentUser?.initials ?: "U",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = currentUser?.fullName ?: "User",
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp
                )
                Text(
                    text = if (currentUser?.role == "admin") "Administrator" else (currentUser?.position ?: "Employee"),
                    color = TextLight,
                    fontSize = 11.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = onSignOut,
            colors = ButtonDefaults.buttonColors(
                containerColor = DangerDark,
                contentColor = Color.White
            ),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Logout,
                contentDescription = "Sign Out",
                tint = Color.White,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Sign Out",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun DrawerNavItem(
    label: String,
    route: String,
    icon: ImageVector,
    currentRoute: String,
    onNavigate: (String) -> Unit
) {
    val isSelected = currentRoute == route
    val bgColor = if (isSelected) Primary.copy(alpha = 0.2f) else Color.Transparent
    val contentColor = if (isSelected) Color.White else TextLight
    val activeBorder = if (isSelected) Primary else Color.Transparent

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
            .clickable { onNavigate(route) }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (isSelected) Primary else contentColor,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = label,
                color = contentColor,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
            )
        }
    }
}

@Composable
fun FlashAlert(
    flash: AttendEaseRepository.FlashMessage?,
    onDismiss: () -> Unit
) {
    if (flash == null) return

    val (bgColor, borderColor, textColor, icon) = when (flash.type) {
        "success" -> Quad(SuccessLight, Success, SuccessDark, Icons.Default.CheckCircle)
        "error" -> Quad(DangerLight, Danger, DangerDark, Icons.Default.Error)
        "warning" -> Quad(WarningLight, Warning, WarningDark, Icons.Default.Warning)
        else -> Quad(InfoLight, Info, Info, Icons.Default.Info)
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = bgColor),
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColor.copy(alpha = 0.4f)),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = borderColor,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = flash.message,
                color = textColor,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            IconButton(
                onClick = onDismiss,
                modifier = Modifier.size(24.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = textColor,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}
