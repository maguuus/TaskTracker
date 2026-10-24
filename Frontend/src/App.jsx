import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import useProject from './context/ProjectContext';
import Home from './pages/Home';
import Board from './pages/Board';
import Login from './pages/Login';
import Profile from './pages/Profile';

import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import useUser from './context/UserContext';
import avatar1 from './image/1.png';
import avatar2 from './image/2.png';
import avatar3 from './image/3.png';
import avatar4 from './image/4.png';
import avatar5 from './image/5.png';
import avatar6 from './image/6.png';
import avatar7 from './image/7.png';
import avatar8 from './image/8.png';
import defaultAvatar from './image/9.jpg';

const mock = {
    id: 1,
    email: "sdsd",
    projects: []
}

function App() {

    const [ currentProject ] = useProject();
    let tryToBoard = `${currentProject ? `${currentProject.id}/board` : `/`}`;
    const [currentUser] = useUser();
    const avatars = {
        "1": avatar1,
        "2": avatar2,
        "3": avatar3,
        "4": avatar4,
        "5": avatar5,
        "6": avatar6,
        "7": avatar7,
        "8": avatar8,
        "9": defaultAvatar
    };

    const currentAvatar = avatars[currentUser?.avatar] ?? defaultAvatar;
    return (
        <BrowserRouter>
            <nav className="container-fluid bg-dark text-light  p-3 d-flex align-items-center">
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
