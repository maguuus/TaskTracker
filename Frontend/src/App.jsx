import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { hub } from './api/index.js';
import InvitationsModal from './components/InvitationsModal';

import useProject from './context/ProjectContext';
import Home from './pages/Home';
import Board from './pages/Board';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';

import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import useUser from './context/UserContext';
import { avatarsDictionary, defaultAvatar } from './hooks/Avatar';


function App() {

    const [ currentProject ] = useProject();
    let tryToBoard = `${currentProject ? `${currentProject.id}/board` : `/`}`;
    const [currentUser] = useUser();
    const [invites, setInvites] = useState([]);
    const [showInvites, setShowInvites] = useState(false);
    const [invitesLoading, setInvitesLoading] = useState(false);

    const loadInvites = async () => {
        if (!currentUser) return;
        try {
            setInvitesLoading(true);
            const res = await api.get('/api/projects/invitations');
            setInvites(res.data || []);
        } catch {
        } finally {
            setInvitesLoading(false);
        }
    };
    
    
    useEffect(() => {
        if (!currentUser) return;

        loadInvites();

        const startHub = async () => {
            try {
                if (hub.state === "Disconnected") {
                    await hub.start();
                }
            } catch (err) {
                console.error("Ошибка подключения сокета:", err);
            }
        };
        startHub();

        const handleStateChanged = (message) => {
            if (message?.type === 'stateChanged' && message?.entityType === 'invitation') {
                loadInvites();
            }
        };

        hub.on('stateChanged', handleStateChanged);

        return () => {
            hub.off('stateChanged', handleStateChanged);
        };
    }, [currentUser]);

    const handleRespond = async (invitationId, accept) => {
        try {
            await api.post(`/api/projects/invitations/${invitationId}/respond`, { accept });
            setInvites(prev => prev.filter(i => i.id !== invitationId));
            if (accept) {
                window.location.reload();
            }
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data || "Ошибка при ответе на приглашение");
        }
    };
    
    const currentAvatar = avatarsDictionary[currentUser?.avatar] ?? defaultAvatar;
    return (
        <BrowserRouter>
            <nav className="app-navbar fixed-top container-fluid bg-dark text-light px-4 py-3 d-flex align-items-center">
    <span className="fw-bold fs-5 me-4" style={{ letterSpacing: '0.5px' }}>
        Task Tracker
    </span>

                <div className="d-flex align-items-center">
                    <NavLink to="/" className="text-light text-decoration-none opacity-75 hover-opacity-100">
                        Главная
                    </NavLink>
                    <span className="mx-3 opacity-25">|</span>

                    <NavLink to="/login" className="text-light text-decoration-none opacity-75 hover-opacity-100">
                        Вход
                    </NavLink>
                    <span className="mx-3 opacity-25">|</span>

                    <NavLink to="/profile" className="text-light text-decoration-none opacity-75 hover-opacity-100">
                        Профиль
                    </NavLink>
                    <span className="mx-3 opacity-25">|</span>

                    <NavLink to={tryToBoard} className="text-light text-decoration-none opacity-75 hover-opacity-100">
                        Доска
                    </NavLink>
                </div>

                {currentUser && (
                    <div className="ms-auto d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-dark position-relative p-1 border-0 shadow-none d-flex align-items-center justify-content-center"
                            style={{ width: 36, height: 36, fontSize: '1.15rem' }}
                            onClick={() => setShowInvites(true)}
                            title="Приглашения в проекты"
                        >
                            📩
                            {invites.length > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                    style={{ fontSize: '0.65rem' }}
                                >
                        {invites.length}
                    </span>
                            )}
                        </button>

                        <NavLink to="/profile">
                            <img
                                src={currentAvatar}
                                className="navbar-avatar"
                                alt="Аватар"
                            />
                        </NavLink>
                    </div>
                )}
            </nav>

            <main className="app-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    } />
                    <Route path="/register" element={
                        <GuestRoute>
                            <Register />
                        </GuestRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/:projectId/board" element={
                        <ProtectedRoute>
                            <Board />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <InvitationsModal
                show={showInvites}
                onHide={() => setShowInvites(false)}
                invites={invites}
                loading={invitesLoading}
                onRespond={handleRespond}
            />
        </BrowserRouter>
    );

}

export default App;
