import { createContext, useContext, useState, useMemo } from 'react';

const BoardContext = createContext();

export function BoardProvider({ children }) {
    const [columns, setColumns] = useState(null);

    const memoized = useMemo(() => ([columns, setColumns]), [columns]);

    return (
        <ProjectContext.Provider value={memoized}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    return useContext(BoardContext);
}