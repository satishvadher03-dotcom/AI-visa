import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import ErrorBoundary from './components/common/ErrorBoundary.js';
import ProtectedRoute from './components/common/ProtectedRoute.js';

// Layouts
import PublicLayout from './layouts/PublicLayout.js';
import CustomerLayout from './layouts/CustomerLayout.js';
import ConsultantLayout from './layouts/ConsultantLayout.js';
import AdminLayout from './layouts/AdminLayout.js';

// Public Pages
import HomePage from './pages/public/HomePage.js';
import VisaCatalogPage from './pages/public/VisaCatalogPage.js';
import ContactPage from './pages/public/ContactPage.js';
import LoginPage from './pages/public/LoginPage.js';
import RegisterPage from './pages/public/RegisterPage.js';
import TermsPrivacyPage from './pages/public/TermsPrivacyPage.js';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard.js';
import CustomerApplications from './pages/customer/CustomerApplications.js';
import CustomerDocuments from './pages/customer/CustomerDocuments.js';
import CustomerAppointments from './pages/customer/CustomerAppointments.js';
import CustomerEnquiries from './pages/customer/CustomerEnquiries.js';
import CustomerProfile from './pages/customer/CustomerProfile.js';

// Consultant Pages
import ConsultantDashboard from './pages/consultant/ConsultantDashboard.js';
import ConsultantCustomers from './pages/consultant/ConsultantCustomers.js';
import ConsultantApplications from './pages/consultant/ConsultantApplications.js';
import ConsultantAppointments from './pages/consultant/ConsultantAppointments.js';
import ConsultantTasks from './pages/consultant/ConsultantTasks.js';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.js';
import AdminUsers from './pages/admin/AdminUsers.js';
import AdminConsultants from './pages/admin/AdminConsultants.js';
import AdminApplications from './pages/admin/AdminApplications.js';
import AdminAppointments from './pages/admin/AdminAppointments.js';
import AdminVisaPrograms from './pages/admin/AdminVisaPrograms.js';
import AdminDocumentRequirements from './pages/admin/AdminDocumentRequirements.js';
import AdminAuditLogs from './pages/admin/AdminAuditLogs.js';
import AdminSettings from './pages/admin/AdminSettings.js';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/visas" element={<VisaCatalogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/legal" element={<TermsPrivacyPage />} />
            </Route>

            {/* Customer Panel */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="applications" element={<CustomerApplications />} />
              <Route path="documents" element={<CustomerDocuments />} />
              <Route path="appointments" element={<CustomerAppointments />} />
              <Route path="enquiries" element={<CustomerEnquiries />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Consultant Panel */}
            <Route
              path="/consultant"
              element={
                <ProtectedRoute allowedRoles={['CONSULTANT', 'ADMIN']}>
                  <ConsultantLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ConsultantDashboard />} />
              <Route path="customers" element={<ConsultantCustomers />} />
              <Route path="applications" element={<ConsultantApplications />} />
              <Route path="appointments" element={<ConsultantAppointments />} />
              <Route path="tasks" element={<ConsultantTasks />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Admin Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="consultants" element={<AdminConsultants />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="visa-programs" element={<AdminVisaPrograms />} />
              <Route path="document-requirements" element={<AdminDocumentRequirements />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
