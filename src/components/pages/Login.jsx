import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import API_CONFIG from '../../config/api'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleRole, setGoogleRole] = useState('student')

  // Redirect to profile if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/profile')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    
    try {
      // For Node.js backend, send JSON instead of form data
      const requestBody = API_CONFIG.BACKEND === 'nodejs' 
        ? JSON.stringify({ email: username, password })
        : new URLSearchParams({ username, password }).toString();
      
      const headers = API_CONFIG.BACKEND === 'nodejs'
        ? { 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/x-www-form-urlencoded' };

      const res = await fetch(API_CONFIG.getApiUrl('/auth/login'), {
        method: 'POST',
        headers,
        body: requestBody,
      })
      const data = await res.json()
      if (!res.ok) {
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map(detail => detail.msg).join(', ')
          throw new Error(errorMessages)
        } else {
          throw new Error(data.error || data.message || data.detail || 'Login failed')
        }
      }
      
      // Use auth context login method
      login(data.access_token)
      setMessage('Logged in successfully!')
      
      // Redirect to profile after successful login
      setTimeout(() => {
        navigate('/profile')
      }, 1000)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const response = await fetch(API_CONFIG.getApiUrl(`/auth/google/url?role=${encodeURIComponent(googleRole)}`))
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage('Failed to get Google OAuth URL')
      }
    } catch (error) {
      console.error('Google OAuth error:', error)
      setMessage('Failed to initiate Google login')
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    if (token) {
      // Use auth context login method
      login(token)
      setMessage('Logged in with Google!')
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.pathname)
      
      // Redirect to profile after Google login
      setTimeout(() => {
        navigate('/profile')
      }, 1000)
    }
  }, [login, navigate])

  return (
    <section className="auth-page">
      <div className="auth-card">
        {/* Hexagon Logo and Name */}
        <div className="footer-logo" style={{marginBottom: '60px', justifyContent: 'center'}}>
          <img src="/ChatGPT Image May 28, 2025 at 01_07_26 AM-min.png" alt="Hexagon" />
          <span>Hexagon</span>
        </div>
        
        <h3 className="auth-title" style={{color: 'transparent'}}>Welcome Back</h3>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div>
            <input 
              className="auth-input" 
              type="email"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your email" 
              required
            />
          </div>
          
          <div>
            <input 
              className="auth-input" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password" 
              required
            />
          </div>
          
          <div className="auth-actions">
            <div>
              <select
                className="auth-input"
                value={googleRole}
                onChange={(e) => setGoogleRole(e.target.value)}
              >
                <option value="student">Sign in as Student</option>
                <option value="hr">Sign in as HR</option>
              </select>
            </div>
            <button 
              className="btn-full" 
              type="submit" 
              disabled={loading}
              style={{
                background: '#000000',
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.22)',
                fontWeight: '500'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <button 
              className="btn-full btn-google" 
              type="button" 
              onClick={loginWithGoogle} 
              disabled={loading}
              style={{
                background: '#ffffff',
                color: '#000000',
                borderColor: 'transparent'
              }}
            >
              Continue with Google
            </button>
          </div>
        </form>
        
        {message && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            color: message.includes('success') ? '#4ade80' : '#ef4444',
            backgroundColor: message.includes('success') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.includes('success') ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {message}
          </div>
        )}
        
        <div className="flex align-center justify-center" style={{marginTop: '24px', textAlign: 'center'}}>
          <p style={{color: '#cfcfcf', fontSize: '14px'}}>
            <a href="/signup" style={{color: '#999999'}}>
            Don't have an account? 
            {' '}Sign up
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Login