import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ProjectProvider } from './context/ProjectContext.jsx'
import { UserProvider } from './context/UserContext.jsx'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <UserProvider>
            <ProjectProvider>
                <App />
            </ProjectProvider>
        </UserProvider>
    </StrictMode>,
)
