import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import { useProject } from './context/ProjectContext';
import Home from './pages/Home';
import Board from './pages/Board';
import Login from './pages/Login';
import Profile from './pages/Profile';

import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { useUser } from './context/UserContext';

const mock = {
    id: 1,
    email: "sdsd",
    projects: []
}

function App() {

    const [ currentProject ] = useProject();
    let tryToBoard = `${currentProject ? `${currentProject.id}/board` : `/`}`;

    return (
        <BrowserRouter>
            <nav className="container-fluid bg-dark text-light pt-3">
                {"Task Tracker: "}
                <NavLink to="/" className="text-light">Главная</NavLink> {"| "}
                <NavLink to="/login" className="text-light">Вход</NavLink> {"| "}
                <NavLink to="/profile" className="text-light">Профиль</NavLink> {"| "}
                <NavLink to={tryToBoard} className="text-light">Доска</NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={
                    <GuestRoute>
                        <Login />
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
        </BrowserRouter>
    );

}

export default App;
