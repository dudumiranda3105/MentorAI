import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SaveCollectionDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (collectionName: string) => void
}

export const SaveCollectionDialog = ({
  isOpen,
  onOpenChange,
  onSave,
}: SaveCollectionDialogProps) => {
  const [collectionName, setCollectionName] = useState('')

  const handleSave = () => {
    if (collectionName.trim()) {
      onSave(collectionName.trim())
      setCollectionName('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Salvar Coleção</DialogTitle>
          <DialogDescription>
            Dê um nome para sua nova coleção de flashcards.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Biologia - Capítulo 1"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={!collectionName.trim()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
