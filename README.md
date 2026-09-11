# **⚠️ ATTENDEASE ANDROID — [ACTIVE BUILDING PHASE / BETA]**

> **IMPORTANT STATUS NOTICE:**
> This repository is currently in an **Active Building / Beta Phase**. Core Android features, native Jetpack Compose interfaces, and Room persistence engines are actively being developed and refined.
---

## 📱 Android Native Application Overview

**AttendEase Android** is a 100% native Android application built with modern Android engineering standards: **Kotlin 2.0**, **Jetpack Compose (Material 3)**, **Android Architecture Components (MVVM)**, **Kotlin Coroutines & StateFlow**, and **Room Database with KSP** for local offline persistence.

---

## ⚙️ Android Configuration & Tech Stack

| Configuration / Tool | Specification | Details |
| :--- | :--- | :--- |
| **Status / Phase** | **BETA / BUILDING PHASE** | In active development |
| **Application ID** | `com.aistudio.attendease.app` | Defined in `app/build.gradle.kts` |
| **Namespace** | `com.attendease` | Base Kotlin package |
| **Compile SDK** | `35` (Android 15) | Android 15 Vanilla Ice Cream |
| **Target SDK** | `35` (Android 15) | Android 15 compatibility |
| **Min SDK** | `26` (Android 8.0 Oreo) | Supports >95% of active Android devices |
| **Java Compatibility** | `JavaVersion.VERSION_21` | Source and target compatibility: Java 21 |
| **Kotlin JVM Target** | `21` | Kotlin 2.0 targeting JVM 21 |
| **Android Gradle Plugin (AGP)** | `8.8.0` | Modern Gradle build configuration |
| **Kotlin Version** | `2.0.21` | Kotlin 2 with Compose Compiler Plugin |
| **KSP Version** | `2.0.21-1.0.27` | Kotlin Symbol Processing for Room compilation |
| **Compose BOM** | `2024.12.01` | Bill of Materials for Jetpack Compose libraries |
| **Room Database** | `2.6.1` (KSP) | Local offline SQLite persistence with Flow streams |
| **UI Design System** | **Material 3 (M3)** | ColorScheme, Typography, Shapes, Edge-to-Edge |
| **Architecture** | **MVVM + Clean Flow** | `AppDatabase` ➔ `AttendEaseRepository` ➔ `MainViewModel` ➔ Compose Screens |

---

## 🏗️ Architecture & Module Structure

```text
AttendEase-Android
├── app/                                 # 🤖 ACTIVE NATIVE ANDROID APPLICATION MODULE
│   ├── build.gradle.kts                 # App-level build config (SDK 35, Compose, Room, KSP)
│   ├── proguard-rules.pro               # ProGuard / R8 rules
│   └── src/main/
│       ├── AndroidManifest.xml          # App entrypoint and permissions
│       ├── java/com/attendease/
│       │   ├── AttendEaseApp.kt         # Application class
│       │   ├── MainActivity.kt          # Single-activity Compose host
│       │   ├── data/
│       │   │   ├── db/
│       │   │   │   ├── AppDatabase.kt   # Room database declaration (Room 2.6.1)
│       │   │   │   └── Daos.kt          # DAOs: User, Attendance, Leave, Salary, Invoice, Rules
│       │   │   ├── model/
│       │   │   │   └── Entities.kt      # Room @Entity definitions & Room type converters
│       │   │   └── repository/
│       │   │       └── AttendEaseRepository.kt # Reactive data layer + Seed dispatcher + Payroll engine
│       │   └── ui/
│       │       ├── MainAppContent.kt    # Navigation & Drawer root controller
│       │       ├── components/
│       │       │   └── CommonComponents.kt # TopBar, NavigationDrawer, KPI Cards, Status Badges
│       │       ├── screens/
│       │       │   ├── auth/            # Native Login screen with demo autofill
│       │       │   ├── admin/           # Admin screens (Dashboard, Attendance, Leaves, Employees,
│       │       │   │                    #                  Payroll Run, Invoices, Settings, Reports)
│       │       │   └── employee/        # Employee screens (Dashboard, Attendance History, Leaves, Payslips)
│       │       ├── theme/               # Color tokens, typography, and Material 3 theme
│       │       └── viewmodels/
│       │           └── MainViewModel.kt # StateFlow-driven state management
│       └── res/                         # Strings, Drawables, Mipmap adaptive icons, Colors
│
├── gradle/
│   └── libs.versions.toml               # Centralized Version Catalog
├── build.gradle.kts                     # Root-level Gradle script
├── settings.gradle.kts                  # Project settings (`rootProject.name = "AttendEase"`)
│
├── 📂 REFERENCE IMPLEMENTATIONS (Not active app code):
│   ├── flask-app/                       # [REFERENCE ONLY] Python / Flask SSR prototype
│   ├── html-app/                        # [REFERENCE ONLY] Vanilla JS / CSS prototype
│   └── react-app/                       # [REFERENCE ONLY] React 19 / Vite prototype
└── README.md
```

---

## 📦 Key Dependencies & Libraries

Configured centrally via `gradle/libs.versions.toml`:

```toml
[versions]
agp = "8.8.0"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.12.01"
navigationCompose = "2.8.5"
room = "2.6.1"
ksp = "2.0.21-1.0.27"
gson = "2.10.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
google-gson = { group = "com.google.code.gson", name = "gson", version.ref = "gson" }
```

---

## 🗄️ Native Local Persistence (Room Database)

The native app uses an offline-first **Room Database (`AppDatabase`)** with reactive Kotlin `Flow` streams:
- **`User` Entity**: Stores staff accounts, credentials, departments, roles (`admin` / `employee`), and account status.
- **`AttendanceRecord` Entity**: Daily check-in, check-out timestamps, calculated hours, and statuses (`Present`, `Late`, `Absent`, `Half-Day`).
- **`LeaveRequest` Entity**: Leave submissions (Vacation, Sick Leave, Personal, Other) with review notes and status (`pending`, `approved`, `rejected`).
- **`SalaryProfile` Entity**: Base salary, component allocations (Basic, HRA, Conveyance, Allowances), and statutory deductions.
- **`Invoice` Entity**: Monthly generated payroll payslips with earnings/deductions breakdown and payment tracking.
- **`PayrollRules` Entity**: Configurable 4-tier payroll cascade, overtime formulas, LOP policies, tax slabs, and corporate branding.

---

## 🔑 Default Demo Credentials

The Room database automatically bootstraps demo accounts on first launch:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` | Full admin management, payroll execution, reports |
| **Employee** | `suryanarayan@company.com` | `employee123` | Personal punch-in, attendance logs, leaves, payslips |
| **Employee** | `alice@company.com` | `employee123` | Sample employee profile |
| **Employee** | `bob@company.com` | `employee123` | Sample employee profile |

*(The login screen also includes convenient 1-tap quick autofill buttons for testing).*

---

## 🛠️ Build & Compilation Commands

### Running with Gradle
To compile the Android app from the terminal:

```bash
# Build the Debug APK
gradle :app:assembleDebug

# Verify compilation
gradle :app:compileDebugKotlin

# Run unit tests
gradle :app:testDebugUnitTest
```

### Generated Outputs
- **Debug APK**: `app/build/outputs/apk/debug/app-debug.apk`

---