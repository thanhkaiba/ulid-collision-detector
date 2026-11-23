import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
import { applyBoardTheme } from './lib/boardTheme'

applyBoardTheme()
import App from './App.tsx'
import { getEngine } from './lib/engine'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// start the Stockfish download right away (a progress pill shows it), so the engine is ready when a page needs it
window.setTimeout(() => getEngine(), 800)
