// Flashcards Types
export interface Flashcard {
  id: string
  question: string
  answer: string
}

export interface FlashcardCollection {
  id: string
  name: string
  createdAt: string // ISO date string
  flashcards: Flashcard[]
}

// Auth Types
export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  isActive: boolean
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    notifications: {
      email: boolean
      push: boolean
    }
  }
  subscription: {
    plan: 'free' | 'premium' | 'pro'
    isActive: boolean
    startDate?: string
    endDate?: string
  }
  usage: {
    flashcardsCreated: number
    oraculoSessions: number
    documentsProcessed: number
  }
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  name?: string
  preferences?: Partial<User['preferences']>
}

// Oráculo Types
export interface OraculoProvider {
  modelos: string[]
}

export interface OraculoProviders {
  [key: string]: OraculoProvider
}

export interface OraculoMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface OraculoConversation {
  sessionId: string
  messages: OraculoMessage[]
  documentType: 'Site' | 'Link Youtube' | '.PDF' | '.CSV' | '.TXT'
  documentContent?: string
  provider: string
  model: string
  createdAt: string
  updatedAt: string
}

export interface OraculoSession {
  sessionId: string
  documentType: string
  provider: string
  model: string
  isActive: boolean
  documentPreview?: string
}

export interface OraculoInitRequest {
  provedor: string
  modelo: string
  apiKey: string
  tipoArquivo: 'Site' | 'Link Youtube' | '.PDF' | '.CSV' | '.TXT'
  arquivo: string | File
  sessionId: string
}

export interface OraculoChatRequest {
  sessionId: string
  message: string
}

export interface OraculoChatResponse {
  response: string
}

// Paginação de mensagens
export interface OraculoMessagesPage {
  sessionId: string
  messages: OraculoMessage[]
  offset: number
  limit: number
  total: number
  hasMore: boolean
  nextOffset: number
}
