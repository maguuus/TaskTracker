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
            <nav className="app-navbar fixed-top container-fluid bg-dark text-light p-3 d-flex align-items-center">
                {"Task Tracker: "}
                <NavLink to="/" className="text-light">Главная</NavLink> {"| "}
                <NavLink to="/login" className="text-light">Вход</NavLink> {"| "}
                <NavLink to="/profile" className="text-light">Профиль</NavLink> {"| "}
                <NavLink to={tryToBoard} className="text-light">Доска</NavLink>
                {currentUser && (<NavLink to="/profile" className="ms-auto"> <img
                    src = {currentAvatar}
                    className="navbar-avatar" 
                    alt ="Аватар"
                    />
                </NavLink>)}
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
