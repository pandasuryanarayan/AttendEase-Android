// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { FlashAlerts } from './components/FlashAlerts';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { AttendanceRecords } from './pages/AttendanceRecords';
import { LeaveRequests } from './pages/LeaveRequests';
import { Reports } from './pages/Reports';

// Payroll Pages
import { RunPayroll } from './pages/RunPayroll';
import { PayrollInvoices } from './pages/PayrollInvoices';
import { PayrollSettings } from './pages/PayrollSettings';
import { MyInvoices } from './pages/MyInvoices';
import { InvoiceView } from './pages/InvoiceView';

const AppContent = () => {
  const { currentUser } = useApp();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Sync active page on user role change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActivePage('admin-dashboard');
      } else {
        setActivePage('employee-dashboard');
      }
    }
  }, [currentUser]);

  // Auth pages
  if (!currentUser) {
    if (authMode === 'register') {
      return <Register onNavigateLogin={() => setAuthMode('login')} />;
    }
    return <Login onNavigateRegister={() => setAuthMode('register')} />;
  }

  // Determine topbar page title
  const getPageTitle = () => {
    switch (activePage) {
      case 'admin-dashboard':
        return 'Admin Dashboard';
      case 'employee-dashboard':
        return 'Dashboard';
      case 'employees':
        return 'Employees';
      case 'attendance':
        return currentUser.role === 'admin' ? 'Attendance Records' : 'My Attendance History';
      case 'leaves':
        return currentUser.role === 'admin' ? 'Leave Management' : 'My Leave Requests';
      case 'reports':
        return 'Analytics & Reports';
      case 'payroll':
        return 'Run Monthly Payroll';
      case 'invoices':
        return 'Payroll Invoices & Register';
      case 'payroll-settings':
        return 'Payroll Policy & Rules Console';
      case 'my-invoices':
        return 'My Payslips & Tax Invoices';
      case 'invoice-view':
      case 'invoice-view-download':
        return 'Tax Invoice & Salary Payslip';
      default:
        return 'AttendEase';
    }
  };

  return (
    <>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="layout">
        <Topbar pageTitle={getPageTitle()} />

        <main className="main-content">
          <FlashAlerts />

          {activePage === 'admin-dashboard' && currentUser.role === 'admin' && (
            <AdminDashboard
              onNavigate={setActivePage}
              onOpenAddEmployee={() => setActivePage('employees')}
            />
          )}

          {activePage === 'employee-dashboard' && currentUser.role === 'employee' && (
            <EmployeeDashboard onNavigate={setActivePage} />
          )}

          {activePage === 'employees' && currentUser.role === 'admin' && <EmployeeManagement />}

          {activePage === 'attendance' && <AttendanceRecords />}

          {activePage === 'leaves' && <LeaveRequests />}

          {activePage === 'reports' && currentUser.role === 'admin' && <Reports />}

          {/* Payroll Routes */}
          {activePage === 'payroll' && currentUser.role === 'admin' && (
            <RunPayroll onNavigate={setActivePage} />
          )}

          {activePage === 'invoices' && currentUser.role === 'admin' && (
            <PayrollInvoices
              onNavigate={setActivePage}
              setSelectedInvoiceId={setSelectedInvoiceId}
            />
          )}

          {activePage === 'payroll-settings' && currentUser.role === 'admin' && (
            <PayrollSettings onNavigate={setActivePage} />
          )}

          {activePage === 'my-invoices' && (
            <MyInvoices
              onNavigate={setActivePage}
              setSelectedInvoiceId={setSelectedInvoiceId}
            />
          )}

          {activePage === 'invoice-view' && (
            <InvoiceView
              selectedInvoiceId={selectedInvoiceId}
              autoPrint={false}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'invoice-view-download' && (
            <InvoiceView
              selectedInvoiceId={selectedInvoiceId}
              autoPrint={true}
              onNavigate={setActivePage}
            />
          )}
        </main>
      </div>
    </>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
