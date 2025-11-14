import { useState, useRef, useEffect, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, User, Bot, Trash2, Copy, RotateCcw } from 'lucide-react'
import { OraculoMessage } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface OraculoChatProps {
  messages: OraculoMessage[]
  onSendMessage: (message: string) => Promise<any>
  onSendMessageStream: (message: string, onChunk: (chunk: string) => void) => Promise<any>
  onClearHistory: () => Promise<any>
  onReset: () => void
  isLoading: boolean
  sessionId: string | null
  useStreaming?: boolean
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  isLoadingMore?: boolean
}

export function OraculoChat({ 
  messages, 
  onSendMessage, 
  onSendMessageStream,
  onClearHistory,
  onReset,
  isLoading, 
  sessionId,
  useStreaming = true,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false
}: OraculoChatProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Monitorar scroll manual do usuário + carregar mais no topo
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (!viewport) return

    let loadingMore = false

    const handleScroll = async () => {
      const thresholdBottom = 120 // proximidade do fim para botão
      const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - thresholdBottom
      setIsNearBottom(atBottom)
      setShowScrollButton(!atBottom)

      // Carrega mais quando chega perto do topo
      if (viewport.scrollTop < 60 && hasMore && onLoadMore && !isLoadingMore && !loadingMore) {
        console.log('🔄 Carregando mais mensagens antigas...')
        loadingMore = true
        const prevHeight = viewport.scrollHeight
        const prevScrollTop = viewport.scrollTop
        
        try {
          await onLoadMore()
          // Aguarda o DOM atualizar
          setTimeout(() => {
            const newHeight = viewport.scrollHeight
            const heightDiff = newHeight - prevHeight
            // Mantém posição após prepend
            viewport.scrollTop = prevScrollTop + heightDiff
            console.log('✅ Mensagens carregadas e posição preservada')
            loadingMore = false
          }, 50)
        } catch (error) {
          console.error('❌ Erro ao carregar mais:', error)
          loadingMore = false
        }
      }
    }
    viewport.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [hasMore, onLoadMore, isLoadingMore])

  // Auto-scroll apenas se o usuário já estiver próximo ao final
  useEffect(() => {
    if (!isNearBottom) return
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages, streamingContent, isNearBottom])

  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')
    setStreamingContent('')

    try {
      if (useStreaming) {
        await onSendMessageStream(message, (chunk) => {
          setStreamingContent(prev => prev + chunk)
        })
        setStreamingContent('')
      } else {
        await onSendMessage(message)
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  // Formatação básica: cabeçalhos simulados, listas, parágrafos
  const formatContent = (text: string): ReactNode => {
    if (/^CONTEUDO_DO_DOCUMENTO|^RESUMO_TRUNCADO_DO_DOCUMENTO/.test(text)) {
      return <em className="text-xs text-muted-foreground">Contexto do documento carregado (oculto). Faça perguntas específicas para usar o conteúdo.</em>
    }

    const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0)
    const elements: ReactNode[] = []
    let listBuffer: string[] = []

    const flushList = () => {
      if (listBuffer.length) {
        elements.push(
          <ul className="list-disc list-inside space-y-1 my-2" key={`list-${elements.length}`}>
            {listBuffer.map((item, i) => <li key={i}>{item.replace(/^[-*]\s*/, '')}</li>)}
          </ul>
        )
        listBuffer = []
      }
    }

    for (const line of lines) {
      if (/^[-*]\s+/.test(line)) {
        listBuffer.push(line)
        continue
      }
      flushList()
      if (line.length < 80 && /[:?]$/.test(line)) {
        elements.push(<h4 className="font-semibold mt-4 mb-1" key={`h-${elements.length}`}>{line}</h4>)
      } else {
        elements.push(<p className="text-sm leading-relaxed" key={`p-${elements.length}`}>{line}</p>)
      }
    }
    flushList()
    return <div className="space-y-2">{elements}</div>
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copiado!',
        description: 'Texto copiado para a área de transferência'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o texto',
        variant: 'destructive'
      })
    }
  }

  const handleClearHistory = async () => {
    try {
      await onClearHistory()
      toast({
        title: 'Histórico Limpo',
        description: 'O histórico da conversa foi limpo com sucesso'
      })
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto flex flex-col shadow-sm border relative">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔮</span>
            </div>
            Chat com Oráculo
            {sessionId && (
              <span className="text-sm text-muted-foreground font-normal">
                ({sessionId.slice(-8)})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              disabled={isLoading || messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4" />
              Nova Sessão
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-[400px] max-h-[calc(100vh-320px)]">
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && !streamingContent && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Olá! Sou o Oráculo, seu assistente baseado no documento carregado.</p>
                <p className="text-sm mt-2">Faça uma pergunta para começar nossa conversa!</p>
              </div>
            )}

            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-3 border-b">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                <span>Carregando mensagens antigas...</span>
              </div>
            )}

            {!isLoadingMore && hasMore && messages.length > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2 border-b cursor-pointer hover:bg-muted/50 transition-colors" onClick={onLoadMore}>
                <span>↑ Role para cima ou clique para carregar mais mensagens</span>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatContent(message.content)}
                  </div>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content)}
                      className="mt-2 h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Mensagem sendo transmitida */}
            {streamingContent && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {formatContent(streamingContent)}
                    <span className="animate-pulse ml-1">▌</span>
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de carregamento */}
            {isLoading && !streamingContent && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {showScrollButton && (
            <div className="sticky bottom-4 flex justify-center pointer-events-none">
              <button
                type="button"
                onClick={scrollToBottom}
                className="pointer-events-auto shadow-sm bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full hover:opacity-90 transition flex items-center gap-1"
              >
                Ir para o fim
              </button>
            </div>
          )}
        </ScrollArea>

        {/* Input de mensagem */}
        <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}