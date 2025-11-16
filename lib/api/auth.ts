/**
 * Authentication API client
 */

// Ensure API URL has protocol
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If URL doesn't start with http:// or https://, add http://
    return envUrl.startsWith('http') ? envUrl : `http://${envUrl}`;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export interface SignupData {
  username: string;
  password: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
}

export interface SigninData {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    is_superuser?: boolean;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string;
  updated_at?: string;
}

class AuthClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Sign up a new user
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(error.detail || 'Signup failed');
    }

    return response.json();
  }

  /**
   * Sign in an existing user
   */
  async signin(data: SigninData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(error.detail || 'Signin failed');
    }

    return response.json();
  }

  /**
   * Get current user information
   */
  async getCurrentUser(userId: number): Promise<User> {
    const response = await fetch(`${this.baseURL}/auth/me?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: response.statusText,
      }));
      throw new Error(error.detail || 'Failed to get user');
    }

    return response.json();
  }

  /**
   * Save user to local storage
   */
  saveUser(user: AuthResponse['user']): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Get user from local storage
   */
  getUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Clear user from local storage (logout)
   */
  logout(): void {
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }
}

// Export singleton instance
export const authClient = new AuthClient();

// Export class for custom instances
export default AuthClient;

