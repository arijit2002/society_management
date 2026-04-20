import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';

import Login from './pages/auth/Login';

import AdminDashboard   from './pages/admin/Dashboard';
import Residents        from './pages/admin/Residents';
import Fees             from './pages/admin/Fees';
import AdminComplaints  from './pages/admin/Complaints';
import Notices          from './pages/admin/Notices';
import AdminAmenities   from './pages/admin/Amenities';
import Staff            from './pages/admin/Staff';
import Reports          from './pages/admin/Reports';

import ResidentDashboard  from './pages/resident/Dashboard';
import MyFees             from './pages/resident/MyFees';
import ResidentComplaints from './pages/resident/Complaints';
import ResidentAmenities  from './pages/resident/Amenities';
import ResidentNotices    from './pages/resident/Notices';

import SecurityDashboard from './pages/security/Dashboard';
import Visitors          from './pages/security/Visitors';

import MaintenanceDashboard from './pages/maintenance/Dashboard';
import Tasks                from './pages/maintenance/Tasks';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  const routes = { admin: '/admin', resident: '/resident', security: '/security', maintenance: '/maintenance' };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/residents"  element={<ProtectedRoute allowedRoles={['admin']}><Residents /></ProtectedRoute>} />
        <Route path="/admin/fees"       element={<ProtectedRoute allowedRoles={['admin']}><Fees /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin/notices"    element={<ProtectedRoute allowedRoles={['admin']}><Notices /></ProtectedRoute>} />
        <Route path="/admin/amenities"  element={<ProtectedRoute allowedRoles={['admin']}><AdminAmenities /></ProtectedRoute>} />
        <Route path="/admin/staff"      element={<ProtectedRoute allowedRoles={['admin']}><Staff /></ProtectedRoute>} />
        <Route path="/admin/reports"    element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />

        {/* Resident */}
        <Route path="/resident"            element={<ProtectedRoute allowedRoles={['resident']}><ResidentDashboard /></ProtectedRoute>} />
        <Route path="/resident/fees"       element={<ProtectedRoute allowedRoles={['resident']}><MyFees /></ProtectedRoute>} />
        <Route path="/resident/complaints" element={<ProtectedRoute allowedRoles={['resident']}><ResidentComplaints /></ProtectedRoute>} />
        <Route path="/resident/amenities"  element={<ProtectedRoute allowedRoles={['resident']}><ResidentAmenities /></ProtectedRoute>} />
        <Route path="/resident/notices"    element={<ProtectedRoute allowedRoles={['resident']}><ResidentNotices /></ProtectedRoute>} />

        {/* Security */}
        <Route path="/security"          element={<ProtectedRoute allowedRoles={['security']}><SecurityDashboard /></ProtectedRoute>} />
        <Route path="/security/visitors" element={<ProtectedRoute allowedRoles={['security']}><Visitors /></ProtectedRoute>} />

        {/* Maintenance */}
        <Route path="/maintenance"       element={<ProtectedRoute allowedRoles={['maintenance']}><MaintenanceDashboard /></ProtectedRoute>} />
        <Route path="/maintenance/tasks" element={<ProtectedRoute allowedRoles={['maintenance']}><Tasks /></ProtectedRoute>} />

        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
