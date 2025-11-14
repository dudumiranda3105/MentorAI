import { useState, useEffect, useCallback } from 'react'
import type { Flashcard, FlashcardCollection } from '@/types'

const STORAGE_KEY = 'flashcard-collections'

interface UseCollectionsOutput {
  collections: FlashcardCollection[]
  isLoading: boolean
  addCollection: (name: string, flashcards: Flashcard[]) => void
  deleteCollection: (collectionId: string) => void
}

export const useCollections = (): UseCollectionsOutput => {
  const [collections, setCollections] = useState<FlashcardCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading to avoid flash of empty content
    const timer = setTimeout(() => {
      try {
        const storedCollections = localStorage.getItem(STORAGE_KEY)
        if (storedCollections) {
          setCollections(JSON.parse(storedCollections))
        }
      } catch (error) {
        console.error('Failed to load collections from storage', error)
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }, 500) // Small delay to show loading skeleton

    return () => clearTimeout(timer)
  }, [])

  const saveCollections = (updatedCollections: FlashcardCollection[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCollections))
      setCollections(updatedCollections)
    } catch (error) {
      console.error('Failed to save collections to storage', error)
    }
  }

  const addCollection = useCallback(
    (name: string, flashcards: Flashcard[]) => {
      const newCollection: FlashcardCollection = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
        flashcards: flashcards.map((fc) => ({
          ...fc,
          id: crypto.randomUUID(),
        })),
      }
      const updatedCollections = [...collections, newCollection]
      saveCollections(updatedCollections)
    },
    [collections],
  )

  const deleteCollection = useCallback(
    (collectionId: string) => {
      const updatedCollections = collections.filter(
        (collection) => collection.id !== collectionId,
      )
      saveCollections(updatedCollections)
    },
    [collections],
  )

  return { collections, isLoading, addCollection, deleteCollection }
}
