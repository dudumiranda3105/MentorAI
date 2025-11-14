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
      const error = await response.json()
      throw new Error(error.error || 'Falha ao atualizar contexto do agente')
    }

    const data = await response.json()
    return data.agentContext
  }
}