import './i18n/index.js'
import { ThemeProvider } from './contexts/ThemeContext'
import Site from './brutal/Site'

// Single-page portfolio. (Add react-router around this if you need extra routes, e.g. an admin area —
// keep those routes outside <ThemeProvider><Site/> so portfolio styles never leak into them.)
export default function App() {
  return (
    <ThemeProvider>
      <Site />
    </ThemeProvider>
  )
}
