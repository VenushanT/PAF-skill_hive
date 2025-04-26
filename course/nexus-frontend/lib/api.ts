export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface LoginRequest {
    username: string
    password: string
}

interface AuthResponse {
    access_token: string
    refresh_token: string
}

export async function loginRequest(credentials: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    })

    if (!res.ok) {
        throw new Error('Login failed')
    }

    return res.json()
}

export async function getCurrentUser() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, { method: 'GET' }); // Make a GET request to fetch the logged-in user
        return res; // Assuming the response contains a User object with a username field
    } catch (err) {
        throw new Error('Failed to fetch user profile');
    }
}
export function getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token')
    }
    return null
}

export function setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
    }
}

export function clearTokens() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
    }
}

/**
 * A helper fetch that automatically includes the access token in headers.
 * Adjust to handle 401 errors and refresh tokens if desired.
 */
export async function authFetch<T = unknown>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
    })

    if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`)
    }



    return res.json().catch(() => ({})) as T // handle empty responses
}
