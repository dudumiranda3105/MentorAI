export interface AgentContext {
  systemPrompt: string
  personality: 'formal' | 'casual' | 'friendly' | 'professional'
  expertise: string[]
  customInstructions: string
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export const agentContextAPI = {
  // Obter contexto atual do agente
  async getAgentContext(): Promise<AgentContext> {
    const response = await fetch(`${API_BASE_URL}/auth/agent-context`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Falha ao carregar contexto do agente')
    }

    const data = await response.json()
    return data.agentContext
  },

  // Atualizar contexto do agente
  async updateAgentContext(context: Partial<AgentContext>): Promise<AgentContext> {
    const response = await fetch(`${API_BASE_URL}/auth/agent-context`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(context)
    })

    if (!response.ok) {
      let message = 'Falha ao atualizar contexto do agente'
      try {
        const error = await response.json()
        message = error.details || error.error || message
      } catch {}
      throw new Error(message)
    }

    const data = await response.json()
    return data.agentContext
  }
}