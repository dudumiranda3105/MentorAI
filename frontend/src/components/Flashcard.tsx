import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Flashcard as FlashcardType } from '@/types'

interface FlashcardProps {
  flashcard: FlashcardType
}

export const Flashcard = ({ flashcard }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFlip = () => {
    if (!isExpanded) {
      setIsFlipped(!isFlipped)
    }
  }

  const handleToggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Prevent card from flipping when clicking expand
    setIsExpanded(!isExpanded)
    if (isExpanded) {
      setIsFlipped(false) // Reset to front when collapsing
    }
  }

  return (
    <div className="w-full [perspective:1000px]">
      <Card
        className={cn(
          'flashcard relative min-h-[200px] w-full cursor-pointer rounded-xl border-2 shadow-lg transition-all duration-500',
          isFlipped && 'is-flipped',
          isExpanded && 'min-h-[250px]',
        )}
        onClick={handleFlip}
      >
        <div className="flashcard-face absolute inset-0 flex flex-col p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-primary">Frente</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
          <CardContent className="flex flex-grow items-center justify-center p-0">
            <p
              className={cn(
                'text-center text-xl',
                !isExpanded && 'line-clamp-3',
              )}
            >
              {flashcard.question}
            </p>
          </CardContent>
          {!isExpanded && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clique para virar
            </div>
          )}
        </div>
        <div className="flashcard-back absolute inset-0 flex flex-col rounded-xl bg-card p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-secondary">Verso</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
          <CardContent className="flex flex-grow items-center justify-center p-0">
            <p
              className={cn(
                'text-center text-xl',
                !isExpanded && 'line-clamp-3',
              )}
            >
              {flashcard.answer}
            </p>
          </CardContent>
        </div>
      </Card>
      {isExpanded && (
        <div className="mt-4 rounded-xl border-2 bg-muted/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-secondary">Verso</h3>
          <p className="text-xl">{flashcard.answer}</p>
        </div>
      )}
    </div>
  )
}
