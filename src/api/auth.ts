import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176',
})

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
    const response = await api.post('/api/auth/login', credentials)
    const data = response.data

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
    const response = await api.post('/api/auth/verify', { token })
    const data = response.data

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
    const response = await api.post('/api/auth/init-accounts')
    return response.data
  } catch (error) {
    console.error('Init accounts error:', error)
    return {
      success: false,
      message: 'Lỗi kết nối server',
    }
  }
}

// Add authorization header to requests
export function getAuthHeaders(options?: { skipContentType?: boolean }): Record<string, string> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  // Add Content-Type by default, unless explicitly skipped
  if (!options?.skipContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}
