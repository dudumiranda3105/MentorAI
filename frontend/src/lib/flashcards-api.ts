import { Flashcard } from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

export interface GenerateFlashcardsRequest {
  texto: string
  provider?: string
  model?: string
  apiKey?: string
}

export interface GenerateFlashcardsFromDocumentRequest {
  tipoArquivo: 'Site' | 'Link Youtube' | '.PDF' | '.CSV' | '.TXT'
  arquivo: string | File
  provider?: string
  model?: string
  apiKey?: string
}

export interface SaveFlashcardsRequest {
  titulo: string
  texto?: string
  flashcards?: Flashcard[]
  provider?: string
  model?: string
  apiKey?: string
}

export interface FlashcardsResponse {
  flashcards: Flashcard[]
  usedAI: boolean
  provider: string
  documentContent?: string
  documentType?: string
}

export class FlashcardsAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  private static getAuthHeadersForFormData() {
    const token = localStorage.getItem('auth_token')
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  // Gerar flashcards a partir de texto
  static async generateFromText(data: GenerateFlashcardsRequest): Promise<FlashcardsResponse> {
    const response = await fetch(`${API_BASE_URL}/flashcards/gerar`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao gerar flashcards')
    }

    return response.json()
  }

  // Gerar flashcards a partir de documento
  static async generateFromDocument(data: GenerateFlashcardsFromDocumentRequest): Promise<FlashcardsResponse> {
    console.log('📤 Enviando requisição para gerar flashcards de documento:', {
      tipoArquivo: data.tipoArquivo,
      isFile: data.arquivo instanceof File,
      fileName: data.arquivo instanceof File ? data.arquivo.name : data.arquivo,
      provider: data.provider,
      model: data.model
    })

    const formData = new FormData()
    
    formData.append('tipoArquivo', data.tipoArquivo)
    
    if (data.arquivo instanceof File) {
      formData.append('arquivo', data.arquivo)
      console.log('📎 Arquivo anexado:', data.arquivo.name, `${(data.arquivo.size / 1024).toFixed(2)} KB`)
    } else {
      formData.append('arquivo', data.arquivo)
    }
    
    if (data.provider) formData.append('provider', data.provider)
    if (data.model) formData.append('model', data.model)
    if (data.apiKey) formData.append('apiKey', data.apiKey)

    const response = await fetch(`${API_BASE_URL}/flashcards/gerar-de-documento`, {
      method: 'POST',
      headers: this.getAuthHeadersForFormData(),
      body: formData
    })

    console.log('📡 Resposta recebida:', { status: response.status, ok: response.ok })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      
      try {
        const error = JSON.parse(errorText)
        throw new Error(error.error || 'Erro ao gerar flashcards do documento')
      } catch (parseError) {
        throw new Error(`Erro ao gerar flashcards: ${errorText}`)
      }
    }

    const result = await response.json()
    console.log('✅ Flashcards gerados:', result.flashcards?.length || 0)
    return result
  }

  // Salvar coleção de flashcards
  static async saveCollection(data: SaveFlashcardsRequest): Promise<{ message: string, collection: any }> {
    const response = await fetch(`${API_BASE_URL}/flashcards/salvar`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao salvar flashcards')
    }

    return response.json()
  }

  // Obter coleções do usuário
  static async getCollections(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/flashcards`, {
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao carregar coleções')
    }

    return response.json()
  }

  // Obter provedores de IA disponíveis
  static async getProviders(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/oraculo/provedores`)

    if (!response.ok) {
      throw new Error('Erro ao carregar provedores')
    }

    return response.json()
  }
}