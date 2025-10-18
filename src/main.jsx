import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../monaco-setup.js';
import 'quill/dist/quill.core.css';
import './index.css'
import './App.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App />
)
