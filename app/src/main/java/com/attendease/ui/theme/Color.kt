package com.attendease.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

val Primary = Color(0xFF6366F1)
val PrimaryDark = Color(0xFF4F46E5)
val PrimaryLight = Color(0xFFEEF2FF)
val PrimaryGlow = Color(0x406366F1)

val Success = Color(0xFF10B981)
val SuccessDark = Color(0xFF059669)
val SuccessLight = Color(0xFFECFDF5)

val Danger = Color(0xFFF43F5E)
val DangerDark = Color(0xFFE11D48)
val DangerLight = Color(0xFFFFF1F2)

val Warning = Color(0xFFF59E0B)
val WarningDark = Color(0xFFD97706)
val WarningLight = Color(0xFFFFFBEB)

val Info = Color(0xFF06B6D4)
val InfoLight = Color(0xFFECFEFF)

val Purple = Color(0xFFA855F7)
val PurpleLight = Color(0xFFFAF5FF)

val DarkBg = Color(0xFF0F172A)
val DarkSurface = Color(0xFF1E1B4B)
val DarkCard = Color(0xFF1E293B)
val DarkBorder = Color(0xFF334155)

val Background = Color(0xFFF1F5F9)
val Surface = Color(0xFFFFFFFF)
val SurfaceSecondary = Color(0xFFF8FAFC)
val Border = Color(0xFFE2E8F0)
val BorderDark = Color(0xFFCBD5E1)

val TextPrimary = Color(0xFF0F172A)
val TextMuted = Color(0xFF64748B)
val TextLight = Color(0xFF94A3B8)

// Gradients
val SidebarGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF0F172A), Color(0xFF1E1B4B), Color(0xFF111827))
)

val AuthGradient = Brush.radialGradient(
    colors = listOf(Color(0xFF1E1B4B), Color(0xFF0F172A))
)

val CheckInCardGradient = Brush.linearGradient(
    colors = listOf(Color(0xFF1E1B4B), Color(0xFF312E81), Color(0xFF4338CA))
)

val NetPayBannerGradient = Brush.linearGradient(
    colors = listOf(Color(0xFF1E1B4B), Color(0xFF312E81))
)

val BrandLogoGradient = Brush.linearGradient(
    colors = listOf(Color(0xFF6366F1), Color(0xFFA855F7))
)

val AvatarGradient = Brush.linearGradient(
    colors = listOf(Color(0xFF818CF8), Color(0xFFC084FC))
)
