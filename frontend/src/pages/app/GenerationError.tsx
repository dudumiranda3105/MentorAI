import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

const GenerationError = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1) // Go back to the previous page
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] flex-col items-center justify-center text-center animate-fade-in">
      <div className="container mx-auto max-w-md px-4 md:px-6">
        <AlertTriangle className="mx-auto h-20 w-20 text-destructive" />
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ocorreu um Erro
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Não foi possível gerar os flashcards. Tente novamente.
        </p>
        <Button size="lg" className="mt-10" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>
      </div>
    </div>
  )
}

export default GenerationError
