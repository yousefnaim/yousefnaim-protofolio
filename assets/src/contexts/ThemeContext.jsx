import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} })

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    // Default for new visitors: light (paper) theme. Returning users keep their saved choice.
    return saved ? saved === 'dark' : false
  })

  // Keep <html data-theme> + localStorage aligned with React state (any source of change)
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => {
    const next = !isDark
    const root = document.documentElement

    // 1. Kill all CSS transitions immediately
    root.classList.add('no-transition')

    // 2. Flip CSS variables + React state synchronously (same microtask)
    root.dataset.theme = next ? 'dark' : 'light'
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)

    // 3. Re-enable transitions after two paint frames
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        root.classList.remove('no-transition')
      )
    )
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
