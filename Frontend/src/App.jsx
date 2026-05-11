import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import { useProject } from './context/ProjectContext';
import Home from './pages/Home';
import Board from './pages/Board';
import Login from './pages/Login';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

    const { currentProject } = useProject();
    let boardPath = `${currentProject ? `${currentProject.id}/` : ``}board`;

    return (
        <BrowserRouter>
            <nav className="container-fluid bg-dark text-light pt-3">
                {"Task Tracker: "}
                <NavLink to="/">Home</NavLink> {"| "}
                <NavLink to="/login">Login</NavLink> {"| "}
                <NavLink to={boardPath}>Board</NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/:projectId?/board" element={<Board />} />
            </Routes>
        </BrowserRouter>
    );

}

export default App;
