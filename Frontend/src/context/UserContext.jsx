import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { hub } from '../api/index.js';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    const memoized = useMemo(() => ([currentUser, setCurrentUser]), [currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        const handleStateChanged = (message) => {
            console.log('SignalR stateChanged event:', message);
        };

        hub.on('stateChanged', handleStateChanged);
        hub.start().catch(console.error);

        return () => {
            hub.off('stateChanged', handleStateChanged);
            hub.stop();
        };
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
