import { createContext, useContext, useState, useMemo } from 'react';

const BoardContext = createContext();

export function BoardProvider({ children }) {
    const [columns, setColumns] = useState([]);

    const memoized = useMemo(() => ([columns, setColumns]), [columns]);

    return (
        <BoardContext.Provider value={memoized}>
            {children}
        </BoardContext.Provider>
    );
}

export function useColumns() {
    return useContext(BoardContext);
}