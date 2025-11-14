import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Settings, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { LoadingModal } from '../../components/LoadingModal'
import { FlashcardsAPI } from '@/lib/flashcards-api'
import type { Flashcard } from '@/types'

const CreateFlashcards = () => {
  const [studyMaterial, setStudyMaterial] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [provider, setProvider] = useState<string>('Gemini')
  const [model, setModel] = useState<string>('gemini-2.5-flash')
  const [apiKey, setApiKey] = useState<string>('')
  const [documentType, setDocumentType] = useState<'text' | 'file' | 'url'>('text')
  const [fileType, setFileType] = useState<'Site' | 'Link Youtube' | '.PDF' | '.CSV' | '.TXT'>('.TXT')
  const [url, setUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [providers, setProviders] = useState<any>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Carregar provedores ao iniciar
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await FlashcardsAPI.getProviders()
        setProviders(data)
        console.log('🔌 Provedores carregados:', data)
      } catch (error) {
        console.error('Erro ao carregar provedores:', error)
      }
    }
    loadProviders()
  }, [])

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setStudyMaterial(event.target.value)
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = {
      '.TXT': ['text/plain'],
      '.PDF': ['application/pdf'],
      '.CSV': ['text/csv', 'application/csv']
    }

    const currentAllowedTypes = allowedTypes[fileType as keyof typeof allowedTypes]
    if (currentAllowedTypes && !currentAllowedTypes.includes(file.type)) {
      toast({
        title: 'Erro no Upload',
        description: `Por favor, selecione um arquivo ${fileType} válido.`,
        variant: 'destructive',
      })
      return
    }

    // Armazena o arquivo selecionado
    setSelectedFile(file)
    setStudyMaterial(`Arquivo selecionado: ${file.name}`)

    // Para arquivos de texto, lê o conteúdo
    if (fileType === '.TXT' && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setStudyMaterial(text)
        toast({
          title: 'Sucesso!',
          description: 'O conteúdo do arquivo foi carregado.',
        })
      }
      reader.onerror = () => {
        toast({
          title: 'Erro de Leitura',
          description: 'Não foi possível ler o conteúdo do arquivo.',
          variant: 'destructive',
        })
      }
      reader.readAsText(file)
    } else {
      // Para outros tipos (PDF, CSV), apenas mostra que foi selecionado
      toast({
        title: 'Arquivo Selecionado',
        description: `${file.name} será processado pela IA.`,
      })
    }
    
    event.target.value = ''
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    
    console.log('🚀 Iniciando geração de flashcards:', { documentType, fileType, provider, model, hasFile: !!selectedFile })
    
    if (documentType === 'text' && !studyMaterial.trim()) return
    if (documentType === 'url' && !url.trim()) return
    if (documentType === 'file' && !selectedFile) return

    setIsLoading(true)

    try {
      let result


      if (documentType === 'text') {
        // Gerar flashcards a partir de texto

        result = await FlashcardsAPI.generateFromText({
          texto: studyMaterial,
          provider,
          model,
          apiKey: apiKey || undefined
        })
      } else if (documentType === 'url') {
        // Gerar flashcards a partir de URL
        const urlFileType = url.includes('youtube.com') || url.includes('youtu.be') ? 'Link Youtube' : 'Site'
        result = await FlashcardsAPI.generateFromDocument({
          tipoArquivo: urlFileType,
          arquivo: url,
          provider,
          model,
          apiKey: apiKey || undefined
        })
      } else {
        // Gerar flashcards a partir de arquivo
        if (!selectedFile) {
          throw new Error('Nenhum arquivo selecionado')
        }
        
        console.log('📝 Gerando flashcards de arquivo:', { 
          fileName: selectedFile.name, 
          fileType, 
          size: selectedFile.size 
        })
        
        result = await FlashcardsAPI.generateFromDocument({
          tipoArquivo: fileType,
          arquivo: selectedFile,
          provider,
          model,
          apiKey: apiKey || undefined
        })
      }



      // Converte a resposta para o formato esperado pelo frontend
      const flashcards: Flashcard[] = result.flashcards.map((card, index) => ({
        id: String(index + 1),
        question: card.pergunta || card.question,
        answer: card.resposta || card.answer
      }))

      if (flashcards.length === 0) {
        throw new Error('Nenhum flashcard foi gerado')
      }

      toast({
        title: 'Flashcards Gerados!',
        description: `${flashcards.length} flashcards criados ${result.usedAI ? 'com IA' : 'automaticamente'}.`,
      })

      navigate('/app/view-flashcards', {
        state: { 
          flashcards,
          generationInfo: {
            usedAI: result.usedAI,
            provider: result.provider,
            documentType: result.documentType
          }
        }
      })

    } catch (error: any) {
      console.error('Erro ao gerar flashcards:', error)
      
      toast({
        title: 'Erro na Geração',
        description: error.message || 'Não foi possível gerar os flashcards.',
        variant: 'destructive',
      })
      
      navigate('/app/generation-error', {
        state: { error: error.message }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <LoadingModal isOpen={isLoading} />
      <div className="flex-grow container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">
                Gerar Flashcards
              </CardTitle>
              <CardDescription>
                Cole seu material de estudo abaixo ou faça o upload de um
                arquivo .txt e nossa IA irá transformá-lo em flashcards para
                você.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seletor de tipo de entrada */}
                <div className="grid w-full gap-2">
                  <Label className="text-lg">Tipo de Material</Label>
                  <Select value={documentType} onValueChange={(value: 'text' | 'file' | 'url') => setDocumentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto Direto</SelectItem>
                      <SelectItem value="file">Upload de Arquivo</SelectItem>
                      <SelectItem value="url">URL/Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo de entrada baseado no tipo selecionado */}
                {documentType === 'text' && (
                  <div className="grid w-full gap-2">
                    <Label htmlFor="study-material" className="text-lg">
                      Seu material de estudo
                    </Label>
                    <Textarea
                      id="study-material"
                      placeholder="Digite ou cole seu texto aqui..."
                      className="min-h-[300px] text-base"
                      value={studyMaterial}
                      onChange={handleTextChange}
                    />
                  </div>
                )}

                {documentType === 'url' && (
                  <div className="grid w-full gap-2">
                    <Label htmlFor="url" className="text-lg">
                      URL do Material
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://exemplo.com ou https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-base"
                    />
                  </div>
                )}

                {documentType === 'file' && (
                  <div className="grid w-full gap-4">
                    <div className="grid w-full gap-2">
                      <Label className="text-lg">Tipo de Arquivo</Label>
                      <Select value={fileType} onValueChange={(value: '.PDF' | '.CSV' | '.TXT') => setFileType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=".TXT">Arquivo de Texto (.txt)</SelectItem>
                          <SelectItem value=".PDF">Documento PDF (.pdf)</SelectItem>
                          <SelectItem value=".CSV">Planilha CSV (.csv)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid w-full gap-2">
                      <Label className="text-lg">Arquivo Selecionado</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleFileUploadClick}
                          disabled={isLoading}
                        >
                          Selecionar Arquivo {fileType}
                        </Button>
                        {studyMaterial && (
                          <p className="mt-2 text-sm text-gray-600">{studyMaterial}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Configurações Avançadas */}
                <div className="border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações Avançadas de IA
                    {showAdvanced ? ' (Ocultar)' : ' (Mostrar)'}
                  </Button>
                  
                  {showAdvanced && (
                    <div className="mt-4 space-y-4 p-4 bg-muted rounded-lg border">
                      <div className="grid w-full gap-2">
                        <Label htmlFor="provider">Provedor de IA</Label>
                        <Select value={provider} onValueChange={setProvider}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o provedor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gemini">Google Gemini</SelectItem>
                            <SelectItem value="Groq">Groq</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid w-full gap-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            {provider === 'Gemini' && (
                              <>
                                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Rápido)</SelectItem>
                                <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Avançado)</SelectItem>
                                <SelectItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Leve)</SelectItem>
                              </>
                            )}
                            {provider === 'Groq' && (
                              <>
                                <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B Instant</SelectItem>
                                <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</SelectItem>
                                <SelectItem value="openai/gpt-oss-120b">GPT OSS 120B</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid w-full gap-2">
                        <Label htmlFor="apiKey">API Key (Opcional)</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="Deixe vazio para usar a chave padrão do sistema"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Se não fornecida, usará a chave padrão do sistema (limitações podem se aplicar)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de submissão */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={
                      (documentType === 'text' && !studyMaterial.trim()) ||
                      (documentType === 'url' && !url.trim()) ||
                      (documentType === 'file' && !selectedFile) ||
                      isLoading
                    }
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isLoading ? 'Gerando Flashcards...' : 'Gerar Flashcards com IA'}
                  </Button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={
                    fileType === '.TXT' ? '.txt' :
                    fileType === '.PDF' ? '.pdf' :
                    fileType === '.CSV' ? '.csv' : '*'
                  }
                  className="hidden"
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default CreateFlashcards
