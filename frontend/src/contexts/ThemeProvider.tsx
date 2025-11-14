import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type Theme = 'dark' | 'light' | 'system'
type FontSize = 'sm' | 'base' | 'lg'

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  fontSize: 'base',
  setFontSize: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultFontSize = 'base',
  storageKeyTheme = 'mentorai-theme',
  storageKeyFontSize = 'mentorai-font-size',
}: {
  children: ReactNode
  defaultTheme?: Theme
  defaultFontSize?: FontSize
  storageKeyTheme?: string
  storageKeyFontSize?: string
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKeyTheme) as Theme) || defaultTheme,
  )
  const [fontSize, setFontSize] = useState<FontSize>(
    () =>
      (localStorage.getItem(storageKeyFontSize) as FontSize) || defaultFontSize,
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    if (fontSize === 'sm') {
      root.style.fontSize = '14px'
    } else if (fontSize === 'lg') {
      root.style.fontSize = '18px'
    } else {
      root.style.fontSize = '16px'
    }
  }, [fontSize])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKeyTheme, newTheme)
      setTheme(newTheme)
    },
    fontSize,
    setFontSize: (newSize: FontSize) => {
      localStorage.setItem(storageKeyFontSize, newSize)
      setFontSize(newSize)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
