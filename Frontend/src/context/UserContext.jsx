import { createContext, useContext, useState, useMemo } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const memoized = useMemo(() => ([currentUser, setCurrentUser]), [currentUser]);

    return (
        <UserContext.Provider value={memoized}>
            {children}
        </UserContext.Provider>
    );
}

function useUser() {
    return useContext(UserContext);
}

export default useUser;