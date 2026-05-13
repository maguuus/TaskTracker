import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import { useProject } from './context/ProjectContext';
import Home from './pages/Home';
import Board from './pages/Board';
import Login from './pages/Login';

import { useUser } from './context/UserContext';

const mock = {
    id: 1,
    email: "sdsd",
    projects: []
}

function App() {

    const [currentUser, setCurrentUser] = useUser();
    if (!currentUser)
        setCurrentUser(mock);

    const [ currentProject ] = useProject();
    let tryToBoard = `${currentProject ? `${currentProject.id}/board` : `/`}`;

    return (
        <BrowserRouter>
            <nav className="container-fluid bg-dark text-light pt-3">
                {"Task Tracker: "}
                <NavLink to="/">Home</NavLink> {"| "}
                <NavLink to="/login">Login</NavLink> {"| "}
                <NavLink to={tryToBoard}>Board</NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/:projectId/board" element={<Board />} />
            </Routes>
        </BrowserRouter>
    );

}

export default App;
