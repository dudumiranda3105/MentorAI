import { useState, useEffect, useRef, RefObject } from 'react'

interface UseScrollObserverOptions {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
}

export const useScrollObserver = (
  options: UseScrollObserverOptions = {},
): [RefObject<HTMLDivElement>, boolean] => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true,
  } = options
  const [isIntersecting, setIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true)
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current)
          }
        } else {
          if (!triggerOnce) {
            setIntersecting(false)
          }
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [ref, threshold, root, rootMargin, triggerOnce])

  return [ref, isIntersecting]
}
