import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/base.css'
import './styles/core.css'
import './styles/social.css'
import './styles/extras.css'
import './styles/counselor.css'

createRoot(document.getElementById('root')!).render(<App />)
