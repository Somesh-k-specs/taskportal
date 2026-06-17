import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AiPage from './pages/AiPage'
import Layout from './components/Layout'
import GlobalDashboard from './pages/GlobalDashboard'
import PublicNavbar from './components/PublicNavbar'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading…</div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// Home/landing page with navbar
function HomeLayout() {
  return (
    <div>
      <PublicNavbar />
      <GlobalDashboard />
    </div>
  )
}

// Login & Register — navbar on top, card centered with generous padding
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"        element={<Navigate to="/home" replace />} />
        <Route path="/home"    element={<HomeLayout />} />

        <Route path="/login"    element={<PublicRoute><AuthLayout><LoginPage /></AuthLayout></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthLayout><RegisterPage /></AuthLayout></PublicRoute>} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
        } />
        <Route path="/ai" element={
          <ProtectedRoute><Layout><AiPage /></Layout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  )
}