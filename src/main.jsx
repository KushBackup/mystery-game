import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// index.css pulls in Tailwind, the Evidence Room @theme tokens, and App.css
// (into the `components` cascade layer). Importing App.css here as well would
// re-emit it unlayered and break utility overrides.
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
