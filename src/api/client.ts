import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

// This import will be resolved in Phase 3 when stores are created.
// For now we use a callback pattern to avoid circular deps.
let onUnauthorized: (() => void) | null = null

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token is injected via setAuthToken() after login
    return config
  },
  (error: unknown) => Promise.reject(error)
)

// Response interceptor — global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
      onUnauthorized?.()
    }

    if (status === 429) {
      const retryAfter = error.response?.headers['retry-after']
      if (retryAfter) {
        const delayMs = parseInt(retryAfter as string, 10) * 1000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        return apiClient.request(error.config!)
      }
    }

    return Promise.reject(error)
  }
)

export function setAuthToken(token: string) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearAuthToken() {
  delete apiClient.defaults.headers.common['Authorization']
}

export default apiClient
