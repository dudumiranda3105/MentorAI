import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Upload, Globe, Youtube, FileText, File, Database, Sparkles, Brain, Key, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { OraculoProviders, OraculoInitRequest } from '@/types'

interface OraculoSetupProps {
  providers: OraculoProviders
  onInitialize: (data: OraculoInitRequest) => Promise<any>
  isLoading: boolean
}

const DOCUMENT_TYPES = [
  { value: 'Site', label: 'Site/URL', icon: Globe, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950', description: 'Carregue qualquer página web' },
  { value: 'Link Youtube', label: 'Vídeo YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950', description: 'Transcrição de vídeos do YouTube' },
  { value: '.PDF', label: 'Arquivo PDF', icon: FileText, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950', description: 'Documentos PDF até 10MB' },
  { value: '.CSV', label: 'Arquivo CSV', icon: Database, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950', description: 'Planilhas e dados tabulares' },
  { value: '.TXT', label: 'Arquivo TXT', icon: File, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950', description: 'Arquivos de texto simples' }
] as const

export function OraculoSetup({ providers, onInitialize, isLoading }: OraculoSetupProps) {
  const [formData, setFormData] = useState({
    provedor: '',
    modelo: '',
    apiKey: '',
    tipoArquivo: 'Site' as 'Site' | 'Link Youtube' | '.PDF' | '.CSV' | '.TXT',
    arquivo: '' as string | File
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.provedor || !formData.modelo || !formData.apiKey || !formData.arquivo) {
      setError('Todos os campos são obrigatórios')
      return
    }

    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await onInitialize({
        ...formData,
        sessionId
      })
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, arquivo: file }))
    }
  }

  const selectedDocType = DOCUMENT_TYPES.find(type => type.value === formData.tipoArquivo)
  const Icon = selectedDocType?.icon || Globe

  const getProviderColor = (provider: string) => {
    if (provider.toLowerCase().includes('groq')) {
      return 'from-orange-500 to-red-500'
    }
    if (provider.toLowerCase().includes('gemini') || provider.toLowerCase().includes('google')) {
      return 'from-blue-500 to-purple-500'
    }
    return 'from-purple-500 to-blue-600'
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-xl">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Configurar MentorAI</CardTitle>
            <CardDescription>Configure seu assistente inteligente em poucos passos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Passo 1: Provedor de IA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <Label htmlFor="provedor" className="text-base font-semibold">Provedor de IA</Label>
            </div>
            <Select
              value={formData.provedor}
              onValueChange={(value) => setFormData(prev => ({ ...prev, provedor: value, modelo: '' }))}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecione um provedor de IA" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(providers).map((provider) => (
                  <SelectItem key={provider} value={provider} className="h-10">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`bg-gradient-to-r ${getProviderColor(provider)} text-white border-none`}>
                        {provider}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passo 2: Modelo */}
          {formData.provedor && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <Label htmlFor="modelo" className="text-base font-semibold">Modelo de IA</Label>
              </div>
              <Select
                value={formData.modelo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, modelo: value }))}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Escolha o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {providers[formData.provedor]?.modelos.map((model) => (
                    <SelectItem key={model} value={model} className="h-10">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        {model}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Passo 3: API Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <Label htmlFor="apiKey" className="text-base font-semibold">API Key</Label>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder={`Digite sua API Key do ${formData.provedor || 'provedor'}`}
                className="h-12 pl-10 text-base"
              />
            </div>
          </div>

          {/* Passo 4: Tipo de Documento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <Label htmlFor="tipoArquivo" className="text-base font-semibold">Tipo de Documento</Label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {DOCUMENT_TYPES.map((type) => {
                const TypeIcon = type.icon
                const isSelected = formData.tipoArquivo === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipoArquivo: type.value, arquivo: '' }))}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50 shadow-lg scale-105' 
                        : 'border-border hover:border-purple-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 mx-auto rounded-lg ${type.bgColor} flex items-center justify-center mb-2`}>
                      <TypeIcon className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <p className="text-xs font-medium text-center">{type.label}</p>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedDocType && (
              <p className="text-sm text-muted-foreground ml-8">{selectedDocType.description}</p>
            )}
          </div>

          {/* Passo 5: Upload/URL do Documento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                5
              </div>
              <Label htmlFor="arquivo" className="text-base font-semibold flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {formData.tipoArquivo === 'Site' && 'URL do Site'}
                {(formData.tipoArquivo as string) === 'Link Youtube' && 'URL do Vídeo YouTube'}
                {['.PDF', '.CSV', '.TXT'].includes(formData.tipoArquivo) && `Arquivo ${formData.tipoArquivo}`}
              </Label>
            </div>
            
            {(formData.tipoArquivo === 'Site' || formData.tipoArquivo === 'Link Youtube') ? (
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="arquivo"
                  type="url"
                  value={formData.arquivo as string}
                  onChange={(e) => setFormData(prev => ({ ...prev, arquivo: e.target.value }))}
                  placeholder={
                    formData.tipoArquivo === 'Site' 
                      ? 'https://exemplo.com/artigo'
                      : 'https://youtube.com/watch?v=...'
                  }
                  className="h-12 pl-10 text-base"
                />
              </div>
            ) : (
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-400 hover:bg-muted/50 group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.tipoArquivo} (Máximo 10MB)
                    </p>
                    {formData.arquivo && (
                      <div className="mt-3 px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {(formData.arquivo as File).name}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept={
                      formData.tipoArquivo === '.PDF' ? '.pdf' :
                      formData.tipoArquivo === '.CSV' ? '.csv' :
                      '.txt'
                    }
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Inicializando MentorAI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Inicializar MentorAI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}