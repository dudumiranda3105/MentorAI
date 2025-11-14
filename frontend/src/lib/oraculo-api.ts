import { 
  OraculoProviders, 
  OraculoInitRequest, 
  OraculoChatRequest, 
  OraculoChatResponse,
  OraculoConversation,
  OraculoSession
} from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

export class OraculoAPI {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  private static getAuthHeadersForFormData(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  static async getProviders(): Promise<OraculoProviders> {
    const response = await fetch(`${API_BASE_URL}/oraculo/provedores`)
    if (!response.ok) {
      throw new Error('Erro ao buscar provedores')
    }
    return response.json()
  }

  static async initializeOraculo(data: OraculoInitRequest): Promise<{ success: boolean, message: string, sessionId: string, documentPreview: string }> {
    let body: FormData | string
    let headers: HeadersInit

    console.log('🚀 Inicializando Oráculo:', { 
      provedor: data.provedor, 
      modelo: data.modelo, 
      tipoArquivo: data.tipoArquivo,
      isFile: data.arquivo instanceof File,
      arquivo: data.arquivo instanceof File ? data.arquivo.name : data.arquivo
    })

    if (data.arquivo instanceof File) {
      // Upload de arquivo
      body = new FormData()
      body.append('arquivo', data.arquivo)
      body.append('provedor', data.provedor)
      body.append('modelo', data.modelo)
      body.append('apiKey', data.apiKey)
      body.append('tipoArquivo', data.tipoArquivo)
      body.append('sessionId', data.sessionId)
      headers = this.getAuthHeadersForFormData()
    } else {
      // URL ou texto
      body = JSON.stringify(data)
      headers = this.getAuthHeaders()
    }

    const response = await fetch(`${API_BASE_URL}/oraculo/inicializar`, {
      method: 'POST',
      headers,
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao inicializar:', { status: response.status, errorText })
      
      try {
        const error = JSON.parse(errorText)
        throw new Error(error.error || 'Erro ao inicializar Oráculo')
      } catch (parseError) {
        throw new Error(`Erro ao inicializar Oráculo: ${errorText}`)
      }
    }

    return response.json()
  }

  static async chat(data: OraculoChatRequest): Promise<OraculoChatResponse> {
    const response = await fetch(`${API_BASE_URL}/oraculo/chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro no chat')
    }

    return response.json()
  }

  static async chatStream(data: OraculoChatRequest): Promise<ReadableStream<Uint8Array> | null> {
    console.log('🌊 Enviando requisição de stream:', { sessionId: data.sessionId, hasMessage: !!data.message });
    
    try {
      const response = await fetch(`${API_BASE_URL}/oraculo/chat/stream`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      })

      console.log('📡 Resposta recebida:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', errorText);
        
        try {
          const error = JSON.parse(errorText)
          throw new Error(error.error || 'Erro no chat stream')
        } catch {
          throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
        }
      }

      return response.body
    } catch (error) {
      console.error('❌ Erro na requisição de stream:', error);
      throw error;
    }
  }

  static async clearHistory(sessionId: string): Promise<{ success: boolean, message: string }> {
    const response = await fetch(`${API_BASE_URL}/oraculo/limpar-historico`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ sessionId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao limpar histórico')
    }

    return response.json()
  }

  static async getHistory(sessionId: string): Promise<OraculoConversation> {
    const response = await fetch(`${API_BASE_URL}/oraculo/historico/${sessionId}`, {
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar histórico')
    }

    return response.json()
  }

  static async getMessagesPage(sessionId: string, offset = 0, limit = 30) {
    const response = await fetch(`${API_BASE_URL}/oraculo/mensagens/${sessionId}?offset=${offset}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar mensagens paginadas')
    }
    return response.json()
  }

  static async getSessions(): Promise<{ sessoesAtivas: string[], conversas: OraculoSession[] }> {
    const response = await fetch(`${API_BASE_URL}/oraculo/sessoes`, {
      headers: this.getAuthHeaders()
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar sessões')
    }

    return response.json()
  }

  // Debug: Verificar status das sessões
  static async debugSessions(): Promise<{ sessoesNaMemoria: string[], totalSessoes: number, userId: string }> {
    const response = await fetch(`${API_BASE_URL}/oraculo/debug`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao carregar debug')
    }

    return response.json()
  }
}