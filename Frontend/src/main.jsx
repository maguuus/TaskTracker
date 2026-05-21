import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ProjectProvider } from './context/ProjectContext.jsx'
import { UserProvider } from './context/UserContext.jsx'

import App from './App.jsx'
import { BoardProvider } from './context/BoardContext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <UserProvider>
            <ProjectProvider>
                <BoardProvider>
                    <App />
                </BoardProvider>
            </ProjectProvider>
        </UserProvider>
    </StrictMode >,
)
