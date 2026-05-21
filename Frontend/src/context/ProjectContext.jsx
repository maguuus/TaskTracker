import { createContext, useContext, useState, useMemo } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [currentProject, setCurrentProject] = useState(null);

    const memoized = useMemo(() => ([currentProject, setCurrentProject]), [currentProject]);

    return (
        <ProjectContext.Provider value={memoized}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    return useContext(ProjectContext);
}