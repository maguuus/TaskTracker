import { useProject } from './context/ProjectContext.jsx';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { Home } from './pages/Home';
import { Board } from './pages/Board';
import { Login } from './pages/Login';
import api from "./api/index.js";

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

    const [responseMsg, setResponseMsg] = useState('Пока ничего нет...');

    const testConnection = async () => {
        try {
            const response = await api.get('/');
            setResponseMsg(`Успех: ${response.data}`);
            console.log(`Данные от backend: ${response.data}`);
        }
        catch (error) {
            setResponseMsg('Ошибка! View console (F12).');
            console.error("CORS error/backend is dead:", error);
        }
    }

    return (
        <BrowserRouter>
            {/* Nav bar сверху*/}
            <nav className="container-fluid bg-dark text-light pt-3">
                Task Tracker:{" "}
                <Link to="/">Home</Link> |{" "}
                <Link to="/login">Login</Link> |{" "}
                <Link to="/board">Board</Link>
            </nav>

            {/* По endpoint подставляет соотвествующий компонент*/}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login/" element={<Login />} />
                <Route path="/:projectName?/board/" element={<Board />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
