import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCollections } from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'
import { Flashcard } from '@/components/Flashcard'
import { StudyMode } from '@/components/StudyMode'
import { ArrowLeft, BookOpenCheck, FileWarning } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { FlashcardCollection } from '@/types'

const CollectionView = () => {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const { collections, isLoading } = useCollections()
  const [collection, setCollection] = useState<FlashcardCollection | null>(null)
  const [isStudyMode, setIsStudyMode] = useState(false)

  useEffect(() => {
    if (!isLoading && collections.length > 0 && collectionId) {
      const foundCollection = collections.find((c) => c.id === collectionId)
      setCollection(foundCollection || null)
    }
  }, [collectionId, collections, isLoading])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
        <Skeleton className="h-10 w-24 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-10" />
        <div className="space-y-8">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6 text-center">
        <FileWarning className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-6 text-3xl font-bold">Coleção não encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          A coleção que você está procurando não existe ou foi removida.
        </p>
        <Button
          className="mt-8"
          onClick={() => navigate('/app/my-collections')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Minhas Coleções
        </Button>
      </div>
    )
  }

  return (
    <>
      {isStudyMode && (
        <StudyMode
          flashcards={collection.flashcards}
          onExit={() => setIsStudyMode(false)}
        />
      )}
      <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
        <div className="mb-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/app/my-collections')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl truncate">
              {collection.name}
            </h1>
            <Button size="lg" onClick={() => setIsStudyMode(true)}>
              <BookOpenCheck className="mr-2 h-5 w-5" />
              Estudar Coleção
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {collection.flashcards.map((flashcard) => (
            <Flashcard key={flashcard.id} flashcard={flashcard} />
          ))}
        </div>
      </div>
    </>
  )
}

export default CollectionView
