import { useState, useCallback } from 'react'
import { OraculoAPI } from '@/lib/oraculo-api'
import { OraculoProviders, OraculoMessage, OraculoInitRequest, OraculoMessagesPage } from '@/types'
import { useToast } from './use-toast'

export function useOraculo() {
  const [providers, setProviders] = useState<OraculoProviders>({})
  const [currentSession, setCurrentSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<OraculoMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [paginationOffset, setPaginationOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { toast } = useToast()

  // Carrega provedores disponíveis
  const loadProviders = useCallback(async () => {
    try {
      const providersData = await OraculoAPI.getProviders()
      setProviders(providersData)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar provedores: ' + (error as Error).message,
        variant: 'destructive'
      })
    }
  }, [toast])

  // Inicializa sessão do Oráculo
  const initializeOraculo = useCallback(async (data: OraculoInitRequest) => {
    setIsLoading(true)
    try {
      const result = await OraculoAPI.initializeOraculo(data)
      setCurrentSession(data.sessionId)
      
      // Carrega as mensagens mais recentes (excluindo contexto do documento)
      try {
        const page = await OraculoAPI.getMessagesPage(data.sessionId, 0, 30)
        // Filtra mensagem de contexto do documento
        const filteredMessages = page.messages.filter(msg => 
          !msg.content.startsWith('CONTEUDO_DO_DOCUMENTO') && 
          !msg.content.startsWith('RESUMO_TRUNCADO_DO_DOCUMENTO')
        )
        setMessages(filteredMessages)
        setPaginationOffset(page.nextOffset)
        setHasMore(page.hasMore)
        console.log('📊 Mensagens iniciais carregadas:', { total: page.total, loaded: filteredMessages.length, hasMore: page.hasMore })
      } catch (pageError) {
        console.log('Sem mensagens anteriores, iniciando vazio')
        setMessages([])
        setPaginationOffset(1)
        setHasMore(false)
      }
      
      setIsInitialized(true)
      
      toast({
        title: 'Sucesso',
        description: result.message
      })
      
      return result
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
  }, [toast])

  // Envia mensagem para o chat
  const sendMessage = useCallback(async (message: string) => {
    if (!currentSession) {
      throw new Error('Sessão não inicializada')
    }

    const userMessage: OraculoMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await OraculoAPI.chat({
        sessionId: currentSession,
        message
      })

      const assistantMessage: OraculoMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Atualiza offset após adicionar 2 novas mensagens (ignora contexto do documento que é mensagem 0)
      const newOffset = paginationOffset + 2
      setPaginationOffset(newOffset)
      
      // Verifica se há mais mensagens para carregar
      try {
        const page = await OraculoAPI.getMessagesPage(currentSession, newOffset, 1)
        setHasMore(page.hasMore)
        console.log('📊 Estado de paginação:', { newOffset, hasMore: page.hasMore, total: page.total })
      } catch (error) {
        console.error('Erro ao verificar paginação:', error)
      }
      
      return response.response
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
  }, [currentSession, paginationOffset, toast])

  // Envia mensagem com streaming
  const sendMessageStream = useCallback(async (
    message: string,
    onChunk: (chunk: string) => void
  ) => {
    if (!currentSession) {
      throw new Error('Sessão não inicializada')
    }

    const userMessage: OraculoMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const stream = await OraculoAPI.chatStream({
        sessionId: currentSession,
        message
      })

      if (!stream) {
        throw new Error('Stream não disponível')
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      // Adiciona mensagem vazia do assistente
      const assistantMessageIndex = messages.length + 1
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk
        onChunk(chunk)

        // Atualiza a mensagem do assistente
        setMessages(prev => {
          const newMessages = [...prev]
          if (newMessages[assistantMessageIndex]) {
            newMessages[assistantMessageIndex] = {
              ...newMessages[assistantMessageIndex],
              content: fullResponse
            }
          }
          return newMessages
        })
      }

      // Atualiza offset após adicionar 2 novas mensagens
      const newOffset = paginationOffset + 2
      setPaginationOffset(newOffset)
      
      // Verifica se há mais mensagens para carregar
      try {
        const page = await OraculoAPI.getMessagesPage(currentSession, newOffset, 1)
        setHasMore(page.hasMore)
        console.log('📊 Estado de paginação (stream):', { newOffset, hasMore: page.hasMore, total: page.total })
      } catch (error) {
        console.error('Erro ao verificar paginação:', error)
      }
      
      return fullResponse
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
  }, [currentSession, messages.length, paginationOffset, toast])

  // Limpa histórico
  const clearHistory = useCallback(async () => {
    if (!currentSession) {
      throw new Error('Sessão não inicializada')
    }

    try {
      await OraculoAPI.clearHistory(currentSession)
      setMessages([])
      toast({
        title: 'Sucesso',
        description: 'Histórico limpo com sucesso'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive'
      })
      throw error
    }
  }, [currentSession, toast])

  // Carrega histórico
  const loadHistory = useCallback(async (sessionId: string) => {
    try {
      // Carrega primeira página (mais recentes)
      const page: OraculoMessagesPage = await OraculoAPI.getMessagesPage(sessionId, 0, 30)
      setMessages(page.messages)
      setPaginationOffset(page.nextOffset)
      setHasMore(page.hasMore)
      setCurrentSession(sessionId)
      setIsInitialized(true)
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive'
      })
      throw error
    }
  }, [toast])

  // Carrega mais mensagens antigas
  const loadMoreMessages = useCallback(async () => {
    if (!currentSession || !hasMore || isLoadingMore) return;
    setIsLoadingMore(true)
    try {
      const page: OraculoMessagesPage = await OraculoAPI.getMessagesPage(currentSession, paginationOffset, 30)
      // Filtra mensagens de contexto do documento
      const filteredMessages = page.messages.filter(msg => 
        !msg.content.startsWith('CONTEUDO_DO_DOCUMENTO') && 
        !msg.content.startsWith('RESUMO_TRUNCADO_DO_DOCUMENTO')
      )
      // Prepend mensagens antigas
      setMessages(prev => [...filteredMessages, ...prev])
      setPaginationOffset(page.nextOffset)
      setHasMore(page.hasMore)
      console.log('🔄 Mais mensagens carregadas:', { loaded: filteredMessages.length, hasMore: page.hasMore })
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentSession, hasMore, isLoadingMore, paginationOffset, toast])

  // Reset da sessão
  const resetSession = useCallback(() => {
    setCurrentSession(null)
    setMessages([])
    setIsInitialized(false)
    setPaginationOffset(0)
    setHasMore(false)
  }, [])

  return {
    providers,
    currentSession,
    messages,
    isLoading,
    isInitialized,
    loadProviders,
    initializeOraculo,
    sendMessage,
    sendMessageStream,
    clearHistory,
    loadHistory,
    resetSession,
    loadMoreMessages,
    hasMore,
    isLoadingMore
  }
}