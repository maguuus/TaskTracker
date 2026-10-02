import { createContext, useContext, useState, useMemo } from 'react';
import hub from '../api/index.js';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const memoized = useMemo(() => ([currentUser, setCurrentUser]), [currentUser]);

    useEffect(() => {
        if(!currentUser) return;
        hub.start().catch(console.error);
        return () => { hub.stop(); };
    }, [currentUser?.id]);

    return (
        <UserContext.Provider value={memoized}>
            {children}
        </UserContext.Provider>
    );
}

/** 
 * @returns {[
 * User | null,
 * (newUser: User) => void
 * ]}
 */

export default function useUser() {
    return useContext(UserContext);
}
