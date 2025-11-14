import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Sun, Moon, Monitor, Trash2, Bot, ChevronRight } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const Settings = () => {
  const navigate = useNavigate()
  const { theme, setTheme, fontSize, setFontSize } = useTheme()
  const { toast } = useToast()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const handleClearData = () => {
    localStorage.removeItem('flashcard-collections')
    toast({
      title: 'Dados limpos!',
      description: 'Suas coleções de flashcards foram removidas.',
    })
    setIsAlertOpen(false)
    window.location.reload()
  }

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
      <h1 className="mb-10 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Configurações
      </h1>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a aparência do aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tema</Label>
              <RadioGroup
                defaultValue={theme}
                onValueChange={(value) => setTheme(value as any)}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="light"
                    id="light"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="light"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Claro
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="dark"
                    id="dark"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="dark"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Escuro
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="system"
                    id="system"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="system"
                    className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    Sistema
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Tamanho da Fonte</Label>
              <ToggleGroup
                type="single"
                defaultValue={fontSize}
                onValueChange={(value) => {
                  if (value) setFontSize(value as any)
                }}
                className="grid grid-cols-3 gap-4"
              >
                <ToggleGroupItem value="sm" aria-label="Pequeno">
                  Pequeno
                </ToggleGroupItem>
                <ToggleGroupItem value="base" aria-label="Normal">
                  Normal
                </ToggleGroupItem>
                <ToggleGroupItem value="lg" aria-label="Grande">
                  Grande
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Inteligência Artificial
            </CardTitle>
            <CardDescription>
              Configure o comportamento do agente IA para geração de flashcards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => navigate('/app/agent-context')}
            >
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Configurar Contexto do Agente
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Personalize como o agente IA cria seus flashcards, incluindo tom, áreas de especialização e instruções específicas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
            <CardDescription>
              Ferramentas de diagnóstico e informações do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full justify-between mb-4"
              onClick={() => navigate('/app/diagnostic')}
            >
              <span className="flex items-center gap-2">
                🔍 Diagnóstico do Sistema
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Verifique o status de conexão com backend, autenticação e serviços do sistema.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>
              Gerencie os dados armazenados localmente no seu navegador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Dados Locais
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza absoluta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente todas as suas coleções de flashcards salvas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Sim, limpar dados
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings
