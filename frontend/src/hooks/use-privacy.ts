import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'mentorai-privacy-accepted'

/**
 * Custom hook to manage privacy policy acceptance state.
 * @returns An object with the acceptance status, a function to accept, and a loading state.
 */
export const usePrivacy = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      setHasAcceptedPrivacy(accepted === 'true')
    } catch (error) {
      console.error(
        'Failed to read privacy acceptance state from storage',
        error,
      )
      setHasAcceptedPrivacy(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const acceptPrivacy = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
      setHasAcceptedPrivacy(true)
    } catch (error) {
      console.error('Failed to save privacy acceptance state to storage', error)
    }
  }, [])

  return { hasAcceptedPrivacy, acceptPrivacy, isLoading }
}
