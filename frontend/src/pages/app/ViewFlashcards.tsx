import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Flashcard } from '@/components/Flashcard'
import { useToast } from '@/hooks/use-toast'
import type { Flashcard as FlashcardType } from '@/types'
import { SaveCollectionDialog } from '@/components/SaveCollectionDialog'
import { useCollections } from '@/hooks/use-collections'

const ViewFlashcards = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addCollection } = useCollections()

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  const flashcards: FlashcardType[] = location.state?.flashcards
  const collectionName: string | undefined = location.state?.collectionName

  useEffect(() => {
    if (!flashcards || flashcards.length === 0) {
      toast({
        title: 'Nenhum flashcard encontrado',
        description: 'Por favor, gere os flashcards primeiro.',
        variant: 'destructive',
      })
      navigate('/app/create-flashcards')
    }
  }, [flashcards, navigate, toast])

  const handleSave = (name: string) => {
    addCollection(name, flashcards)
    toast({
      title: 'Salvo com sucesso!',
      description: `A coleção "${name}" foi salva.`,
    })
    navigate('/app/my-collections')
  }

  const handleGenerateAgain = () => {
    navigate('/app/create-flashcards')
  }

  if (!flashcards) {
    return null
  }

  return (
    <>
      <SaveCollectionDialog
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSave}
      />
      <div className="flex-grow container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {collectionName || 'Flashcards Gerados'}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Revise os flashcards abaixo. Você pode expandir para ver mais
              detalhes ou clicar para virar.
            </p>
          </div>

          <div className="space-y-8">
            {flashcards.map((flashcard) => (
              <Flashcard key={flashcard.id} flashcard={flashcard} />
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            {!collectionName && (
              <Button size="lg" onClick={() => setIsSaveDialogOpen(true)}>
                Salvar flashcards
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={handleGenerateAgain}>
              {collectionName ? 'Criar outra coleção' : 'Gerar novamente'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ViewFlashcards
