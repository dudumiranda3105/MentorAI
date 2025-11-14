import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Flashcard as FlashcardType } from '@/types'

interface StudyModeProps {
  flashcards: FlashcardType[]
  onExit: () => void
}

export const StudyMode = ({ flashcards, onExit }: StudyModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length,
    )
  }

  const currentFlashcard = flashcards[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 right-2 z-10 h-10 w-10 rounded-full"
          onClick={onExit}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="w-full [perspective:1200px]">
          <Card
            className={cn(
              'flashcard relative min-h-[400px] w-full cursor-pointer rounded-xl border-2 shadow-2xl transition-transform duration-700',
              isFlipped && 'is-flipped',
            )}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="flashcard-face absolute inset-0 flex flex-col p-6">
              <h3 className="text-lg font-semibold text-primary">Frente</h3>
              <CardContent className="flex flex-grow items-center justify-center p-0">
                <p className="text-center text-2xl md:text-3xl">
                  {currentFlashcard.question}
                </p>
              </CardContent>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <RefreshCw className="mr-2 h-4 w-4" />
                Clique para virar
              </div>
            </div>
            <div className="flashcard-back absolute inset-0 flex flex-col rounded-xl bg-card p-6">
              <h3 className="text-lg font-semibold text-secondary">Verso</h3>
              <CardContent className="flex flex-grow items-center justify-center p-0">
                <p className="text-center text-2xl md:text-3xl">
                  {currentFlashcard.answer}
                </p>
              </CardContent>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrev}
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <p className="text-lg font-medium text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={handleNext}
            disabled={flashcards.length <= 1}
          >
            Próximo
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
