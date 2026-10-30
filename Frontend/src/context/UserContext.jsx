import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { hub } from '../api/index.js';
import api from '../api/index.js';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const reloadUser = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCurrentUser(null);
            setLoading(false);
            return null;
        }

        try {
            const userProfile = (await api.get('/api/user/me')).data;
            const fullUser = { ...userProfile, projects: [] };
            setCurrentUser(fullUser);
            return fullUser;
        } catch (error) {
            console.error("Токен невалиден или просрочен:", error);
            localStorage.removeItem("token");
            setCurrentUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        reloadUser();
    }, [reloadUser]);

    useEffect(() => {
        if (!currentUser) return;

        const syncHub = async () => {
            try {
                if (hub.state === "Connected") {
                    await hub.stop();
                }
                if (hub.state === "Disconnected") {
                    await hub.start();
                }
            } catch (err) {
                console.error("SignalR Connection Error:", err);
            }
        };

        syncHub();
    }, [currentUser?.id]);

    const memoized = useMemo(() => ([currentUser, setCurrentUser, reloadUser]), [currentUser, reloadUser]);

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <UserContext.Provider value={memoized}>
            {children}
        </UserContext.Provider>
    );
}

export default function useUser() {
    return useContext(UserContext);
}