import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

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
                    <NavLink to="/profile" className="ms-auto">
                        <img
                            src={currentAvatar}
                            className="navbar-avatar"
                            alt="Аватар"
                        />
                    </NavLink>
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
        </BrowserRouter>
    );

}

export default App;
