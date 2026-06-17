import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('taskportal_token')
    const storedUser  = localStorage.getItem('taskportal_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (authResponse) => {
    const { token, username, email } = authResponse
    setToken(token)
    setUser({ username, email })
    localStorage.setItem('taskportal_token', token)
    localStorage.setItem('taskportal_user', JSON.stringify({ username, email }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('taskportal_token')
    localStorage.removeItem('taskportal_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
