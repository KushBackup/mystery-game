import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
// index.css pulls in Tailwind, the Evidence Room @theme tokens, and App.css
// (into the `components` cascade layer). Importing App.css here as well would
// re-emit it unlayered and break utility overrides.
import './index.css'

// Killers Night is the game. `?classic` still opens the retiring Greenr case
// until it is deleted (plan milestone M6). Each is lazy so neither bundle
// initialises the other's Firebase app: the classic game's config.js
// connects straight to the live database on import.
const classic = new URLSearchParams(location.search).has('classic')
const Root = lazy(() => (classic ? import('./App.jsx') : import('./KillersApp.jsx')))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-[100dvh] bg-ink" />}>
      <Root />
    </Suspense>
  </StrictMode>,
)
