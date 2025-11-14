import { useEffect } from 'react'
import { OraculoSetup } from '@/components/OraculoSetup'
import { OraculoChat } from '@/components/OraculoChat'
import { useOraculo } from '@/hooks/use-oraculo'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Sparkles, FileText, Video, Globe, Database, Brain, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function OraculoPage() {
  const {
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
    resetSession,
    loadMoreMessages,
    hasMore,
    isLoadingMore
  } = useOraculo()

  useEffect(() => {
    loadProviders()
  }, [loadProviders])

  // Se ainda está carregando os provedores
  if (Object.keys(providers).length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md border-none shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 relative z-10" />
              </div>
              <p className="text-muted-foreground mt-6 text-lg">Carregando provedores...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const documentTypes = [
    { icon: Globe, label: 'Sites/URLs', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
    { icon: Video, label: 'YouTube', color: 'text-red-500 bg-red-50 dark:bg-red-950' },
    { icon: FileText, label: 'PDF', color: 'text-green-500 bg-green-50 dark:bg-green-950' },
    { icon: Database, label: 'CSV', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' },
    { icon: FileText, label: 'TXT', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header com gradiente animado */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <Brain className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                MentorAI
              </h1>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">Assistente inteligente baseado em documentos</p>
          </div>
        </div>
      </div>

      {/* Alert estilizado */}
      {!isInitialized && (
        <div className="max-w-3xl mx-auto">
          <Alert className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
            <AlertCircle className="h-5 w-5 text-purple-600" />
            <AlertDescription className="ml-2">
              <div className="space-y-3">
                <strong className="text-purple-900 dark:text-purple-100 text-base">Como usar o MentorAI:</strong>
                <ol className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">1</span>
                    <span>Escolha um provedor de IA (Groq ou Gemini) e insira sua API Key</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">2</span>
                    <span>Selecione o tipo de documento e forneça o arquivo/URL</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">3</span>
                    <span>Clique em "Inicializar MentorAI" para começar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">4</span>
                    <span>Faça perguntas sobre o conteúdo do documento carregado</span>
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Área principal */}
      <div className="max-w-5xl mx-auto">
        {!isInitialized ? (
          <OraculoSetup
            providers={providers}
            onInitialize={initializeOraculo}
            isLoading={isLoading}
          />
        ) : (
          <OraculoChat
            messages={messages}
            onSendMessage={sendMessage}
            onSendMessageStream={sendMessageStream}
            onClearHistory={clearHistory}
            onReset={resetSession}
            isLoading={isLoading}
            sessionId={currentSession}
            useStreaming={true}
            onLoadMore={loadMoreMessages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>

      {/* Cards informativos (só aparecem antes da inicialização) */}
      {!isInitialized && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card de tipos de documento */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Tipos de Documento Suportados</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {documentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div 
                      key={type.label}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{type.label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Card de provedores */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Provedores de IA</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                      Groq
                    </Badge>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      Llama 3.1 8B Instant
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      Llama 3.3 70B Versatile
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      OpenAI GPT OSS
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none">
                      Google Gemini
                    </Badge>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Gemini 2.5 Flash
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Gemini 2.5 Pro
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Gemini 2.5 Flash Lite
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}