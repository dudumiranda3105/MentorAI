import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  ChangePasswordRequest,
  UpdateProfileRequest
} from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

export class AuthAPI {
  // Registrar usuário
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao registrar usuário')
    }

    return response.json()
  }

  // Login
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao fazer login')
    }

    return response.json()
  }

  // Logout
  static async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.error('Erro ao fazer logout no servidor:', error)
      }
    }

    // Limpar dados locais independentemente do resultado
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  // Obter perfil do usuário
  static async getProfile(): Promise<{ user: User }> {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao obter perfil')
    }

    return response.json()
  }

  // Atualizar perfil
  static async updateProfile(data: UpdateProfileRequest): Promise<{ message: string, user: User }> {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar perfil')
    }

    return response.json()
  }

  // Alterar senha
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao alterar senha')
    }

    return response.json()
  }

  // Verificar token
  static async verifyToken(): Promise<{ valid: boolean, user: User }> {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Token inválido')
    }

    return response.json()
  }

  // Salvar dados de autenticação
  static saveAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token)
    localStorage.setItem('user_data', JSON.stringify(authResponse.user))
  }

  // Obter token
  static getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  // Obter dados do usuário salvos localmente
  static getSavedUser(): User | null {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  // Verificar se está autenticado
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Limpar dados de autenticação
  static clearAuthData(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }
}