import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'quill/dist/quill.core.css';
import './index.css'
import './App.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
