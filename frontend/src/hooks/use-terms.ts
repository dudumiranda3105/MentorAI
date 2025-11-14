import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mentorai-terms-accepted'

interface UseTermsOutput {
  hasAcceptedTerms: boolean
  acceptTerms: () => void
  isLoading: boolean
}

export const useTerms = (): UseTermsOutput => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(STORAGE_KEY)
      if (storedValue) {
        setHasAcceptedTerms(JSON.parse(storedValue))
      }
    } catch (error) {
      console.error('Failed to read terms acceptance from storage', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const acceptTerms = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(true))
      setHasAcceptedTerms(true)
    } catch (error) {
      console.error('Failed to save terms acceptance to storage', error)
    }
  }, [])

  return { hasAcceptedTerms, acceptTerms, isLoading }
}
