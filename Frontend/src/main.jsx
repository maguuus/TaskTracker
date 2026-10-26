import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ProjectProvider } from './context/ProjectContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { BoardProvider } from './context/BoardContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

import App from './App.jsx'

import './index.css'
import './App.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <UserProvider>
                <ProjectProvider>
                    <BoardProvider>
                        <App />
                    </BoardProvider>
                </ProjectProvider>
            </UserProvider>
        </ThemeProvider>
    </StrictMode>
)