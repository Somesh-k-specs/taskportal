import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/home',      label: 'Home',         icon: '🏠' },
  { to: '/dashboard', label: 'Dashboard',    icon: '📋' },
  { to: '/ai',        label: 'AI Assistant', icon: '🤖' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <span className="text-2xl">✅</span>
          <span className="font-bold text-gray-900 text-lg">DoAble</span>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 flex-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-blue-50 text-blue-700'
                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}
                  className="p-1 text-gray-600 hover:text-gray-900">
            ☰
          </button>
          <span className="font-bold text-gray-900">TaskPortal</span>
        </header>

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}