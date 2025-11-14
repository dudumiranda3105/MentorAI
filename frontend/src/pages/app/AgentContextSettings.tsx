import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Bot, Sparkles, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { agentContextAPI, type AgentContext } from '@/lib/agent-context-api'

const AgentContextSettings = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [context, setContext] = useState<AgentContext>({
    systemPrompt: 'Você é um assistente educacional especializado em criar flashcards e responder perguntas sobre documentos. Seja claro, conciso e pedagogicamente útil.',
    personality: 'friendly',
    expertise: ['educação', 'flashcards', 'estudo'],
    customInstructions: ''
  })
  const [newExpertise, setNewExpertise] = useState('')

  useEffect(() => {
    loadAgentContext()
  }, [])

  const loadAgentContext = async () => {
    try {
      setLoading(true)

      
      const data = await agentContextAPI.getAgentContext()
      setContext(data)
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
      
      toast({
        title: 'Erro ao carregar configurações',
        description: error instanceof Error ? error.message : 'Não foi possível carregar as configurações do agente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await agentContextAPI.updateAgentContext(context)
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do agente foram atualizadas com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações do agente.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !context.expertise.includes(newExpertise.trim())) {
      setContext(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }))
      setNewExpertise('')
    }
  }

  const removeExpertise = (expertise: string) => {
    setContext(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }))
  }

  const personalityOptions = [
    { value: 'formal', label: 'Formal', description: 'Linguagem acadêmica e técnica' },
    { value: 'casual', label: 'Casual', description: 'Linguagem descontraída e informal' },
    { value: 'friendly', label: 'Amigável', description: 'Linguagem acessível e acolhedora' },
    { value: 'professional', label: 'Profissional', description: 'Linguagem técnica e objetiva' }
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/app/settings')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Contexto do Agente</h1>
            <p className="text-muted-foreground">
              Configure como o agente IA deve se comportar ao gerar flashcards
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Prompt do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Prompt do Sistema
            </CardTitle>
            <CardDescription>
              Define como o agente deve se comportar fundamentalmente. Este será o contexto base para todas as interações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={context.systemPrompt}
              onChange={(e) => setContext(prev => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="Você é um assistente educacional especializado em criar flashcards..."
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {context.systemPrompt.length}/2000 caracteres
            </p>
          </CardContent>
        </Card>

        {/* Personalidade */}
        <Card>
          <CardHeader>
            <CardTitle>Personalidade</CardTitle>
            <CardDescription>
              Define o tom e estilo de comunicação do agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={context.personality}
              onValueChange={(value: any) => setContext(prev => ({ ...prev, personality: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma personalidade" />
              </SelectTrigger>
              <SelectContent>
                {personalityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Áreas de Especialização */}
        <Card>
          <CardHeader>
            <CardTitle>Áreas de Especialização</CardTitle>
            <CardDescription>
              Defina as áreas de conhecimento em que o agente deve focar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newExpertise}
                onChange={(e) => setNewExpertise(e.target.value)}
                placeholder="Ex: matemática, história, programação..."
                onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                maxLength={50}
              />
              <Button onClick={addExpertise} disabled={!newExpertise.trim()}>
                Adicionar
              </Button>
            </div>
            
            {context.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {context.expertise.map((expertise, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {expertise}
                    <button
                      onClick={() => removeExpertise(expertise)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Máximo de 10 áreas de especialização
            </p>
          </CardContent>
        </Card>

        {/* Instruções Personalizadas */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções Personalizadas</CardTitle>
            <CardDescription>
              Adicione instruções específicas sobre como o agente deve criar os flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={context.customInstructions}
              onChange={(e) => setContext(prev => ({ ...prev, customInstructions: e.target.value }))}
              placeholder="Ex: Sempre inclua exemplos práticos, foque em conceitos fundamentais, evite termos muito técnicos..."
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {context.customInstructions.length}/1000 caracteres
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/app/settings')}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !context.systemPrompt.trim()}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AgentContextSettings