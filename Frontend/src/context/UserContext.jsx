import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { hub } from '../api/index.js';
import api from '../api/index.js'; // импортируем axios инстанс

const UserContext = createContext();

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function initAuth() {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userProfile = (await api.get('/api/user/me')).data;
                    setCurrentUser({ ...userProfile, projects: [] });
                } catch (error) {
                    console.error("Токен невалиден или просрочен:", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        }

        initAuth();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        if (hub.state === "Disconnected") {
            hub.start().catch(err => console.error("SignalR Connection Error:", err));
        }
    }, [currentUser?.id]);

    const memoized = useMemo(() => ([currentUser, setCurrentUser]), [currentUser]);

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