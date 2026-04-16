import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

import Landing from '../pages/Landing'
import RoleSelect from '../pages/RoleSelect'
import Register from '../pages/Register'
import Login from '../pages/Login'
import VisitorForm from '../pages/VisitorForm'
import VisitorQR from '../pages/VisitorQR'
import SecurityDashboard from '../pages/SecurityDashboard'
import OwnerDashboard from '../pages/OwnerDashboard'
import AdminDashboard from '../pages/AdminDashboard'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/role-select" element={<RoleSelect />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/visitor-form" element={<VisitorForm />} />
          <Route path="/visitor-qr" element={<VisitorQR />} />

          {/* Protected routes */}
          <Route path="/security" element={
            <ProtectedRoute allowedRoles={['security']}>
              <SecurityDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
