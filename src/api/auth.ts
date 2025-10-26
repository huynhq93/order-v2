const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5176/api'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token: string
    user: {
      username: string
      role: string
    }
  }
}

interface VerifyResponse {
  success: boolean
  message?: string
  data?: {
    user: {
      username: string
      role: string
    }
  }
}

// Get token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

// Save token to localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token)
}

// Remove token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token')
}

// Login API
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (data.success && data.data?.token) {
      setAuthToken(data.data.token)
    }

    return data
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: 'Lỗi kết nối server',
    }
  }
}

// Verify token API
export async function verifyToken(): Promise<VerifyResponse> {
  const token = getAuthToken()

  if (!token) {
    return {
      success: false,
      message: 'No token found',
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!data.success) {
      removeAuthToken()
    }

    return data
  } catch (error) {
    console.error('Verify token error:', error)
    removeAuthToken()
    return {
      success: false,
      message: 'Lỗi kết nối server',
    }
  }
}

// Logout
export function logout(): void {
  removeAuthToken()
  window.location.href = '/login'
}

// Initialize default accounts
export async function initAccounts(): Promise<{
  success: boolean
  message: string
  data?: Array<{ username: string; role: string }>
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/init-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return await response.json()
  } catch (error) {
    console.error('Init accounts error:', error)
    return {
      success: false,
      message: 'Lỗi kết nối server',
    }
  }
}

// Add authorization header to requests
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}
