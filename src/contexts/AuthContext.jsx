import React, { createContext, useContext, useState, useEffect } from 'react'
import API_CONFIG from '../config/api.js'
import { requestNotificationPermission } from '../utils/pushNotifications.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('hexagon_token')
    if (storedToken) {
      setToken(storedToken)
      fetchUserProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserProfile = async (authToken) => {
    if (!authToken) {
      setLoading(false)
      return
    }
    
    try {
      const response = await fetch(API_CONFIG.getApiUrl('/users/me'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setRole(userData.role || null)
      } else if (response.status === 401) {
        // Token is invalid or expired, remove it
        console.log('Token expired or invalid, logging out')
        localStorage.removeItem('hexagon_token')
        setToken(null)
        setUser(null)
        setRole(null)
      } else {
        // Other error
        console.error('Failed to fetch user profile:', response.status, response.statusText)
        localStorage.removeItem('hexagon_token')
        setToken(null)
        setUser(null)
        setRole(null)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      localStorage.removeItem('hexagon_token')
      setToken(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (authToken) => {
    setToken(authToken)
    localStorage.setItem('hexagon_token', authToken)
    await fetchUserProfile(authToken)
    
    // Request notification permission immediately after login
    if (authToken) {
      try {
        // Small delay to ensure user is fully logged in
        setTimeout(async () => {
          await requestNotificationPermission()
        }, 500)
      } catch (err) {
        console.error('Failed to request notification permission:', err)
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRole(null)
    localStorage.removeItem('hexagon_token')
  }

  const isAuthenticated = () => {
    return !!token && !!user
  }

  const hasRole = (requiredRole) => {
    if (!requiredRole) return true
    return role === requiredRole
  }

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('hexagon_token')
    if (storedToken) {
      await fetchUserProfile(storedToken)
    }
  }

  const value = {
    user,
    token,
    loading,
    role,
    login,
    logout,
    isAuthenticated,
    hasRole,
    fetchUserProfile,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      <div data-role={role || 'guest'}>
        {children}
      </div>
    </AuthContext.Provider>
  )
}
