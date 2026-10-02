import { createContext, useContext, useState, useMemo } from 'react';

const BoardContext = createContext(null);

export function BoardProvider({ children }) {
    const [columns, setColumns] = useState([]);

    const memoized = useMemo(() => ([columns, setColumns]), [columns]);

    return (
        <BoardContext.Provider value={memoized}>
            {children}
        </BoardContext.Provider>
    );
}

/**
 * @returns {[
 * Column[],
 * (columns: Column[]) => void
 * ]}
 */

export default function useColumns() {
    return useContext(BoardContext);
}