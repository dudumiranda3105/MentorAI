import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookCopy, Trash2, PlusCircle, FileWarning } from 'lucide-react'
import { useCollections } from '@/hooks/use-collections'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'

const MyCollections = () => {
  const navigate = useNavigate()
  const { collections, deleteCollection, isLoading } = useCollections()
  const { toast } = useToast()
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(
    null,
  )

  const handleOpenCollection = (collectionId: string) => {
    navigate(`/app/collections/${collectionId}`)
  }

  const handleDeleteConfirm = () => {
    if (collectionToDelete) {
      deleteCollection(collectionToDelete)
      toast({
        title: 'Coleção excluída!',
        description: 'A coleção de flashcards foi removida com sucesso.',
      })
      setCollectionToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-grow container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-10">
            Minhas Coleções
          </h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-10" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-10">
          Minhas Coleções
        </h1>

        {collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{collection.name}</CardTitle>
                  <CardDescription>
                    Criado em{' '}
                    {format(
                      new Date(collection.createdAt),
                      "dd 'de' MMMM, yyyy",
                      {
                        locale: ptBR,
                      },
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {collection.flashcards.length} flashcards
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={() => handleOpenCollection(collection.id)}>
                    <BookCopy className="mr-2 h-4 w-4" />
                    Abrir
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setCollectionToDelete(collection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá
                          permanentemente sua coleção de flashcards.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setCollectionToDelete(null)}
                        >
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileWarning className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              Nenhuma coleção encontrada
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Você ainda não salvou nenhuma coleção de flashcards.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/app/create-flashcards')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar nova coleção
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCollections
