import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LoginRequest, RegisterRequest } from '@/types'
import { AuthAPI } from '@/lib/auth-api'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = AuthAPI.getToken()
        if (token) {
          const result = await AuthAPI.verifyToken()
          if (result.valid) {
            setUser(result.user)
          } else {
            AuthAPI.clearAuthData()
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        AuthAPI.clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await AuthAPI.login(data)
      AuthAPI.saveAuthData(response)
      setUser(response.user)
      
      toast({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso'
      })
      
      navigate('/app/my-collections')
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [navigate, toast])

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await AuthAPI.register(data)
      AuthAPI.saveAuthData(response)
      setUser(response.user)
      
      toast({
        title: 'Bem-vindo!',
        description: 'Conta criada com sucesso'
      })
      
      navigate('/app/my-collections')
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive'
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [navigate, toast])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await AuthAPI.logout()
      setUser(null)
      
      toast({
        title: 'Até logo!',
        description: 'Logout realizado com sucesso'
      })
      
      navigate('/')
    } catch (error) {
      console.error('Erro no logout:', error)
      // Mesmo com erro, limpa os dados locais
      AuthAPI.clearAuthData()
      setUser(null)
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }, [navigate, toast])

  const updateUser = useCallback((userData: User) => {
    setUser(userData)
    localStorage.setItem('user_data', JSON.stringify(userData))
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
