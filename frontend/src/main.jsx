import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/style.css'
import './assets/components.css'
import './assets/responsive.css'
import './assets/admin.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
