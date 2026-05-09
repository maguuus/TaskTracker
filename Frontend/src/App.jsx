import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { Home } from './pages/Home';
import { Board } from './pages/Board';
import { Login } from './pages/Login';

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import api from "./api/index.js";

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
    <>
    <BrowserRouter>
    {/* Navigation */}
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/board">Board</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </BrowserRouter>
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Тест связи Front ↔ Back</h1>
        <button
          onClick={testConnection}
          style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}
        >
          Дернуть API
        </button>
        <p style={{ marginTop: '20px', fontSize: '20px', color: '#646cff' }}>
          {responseMsg}
        </p>
      </div>
    </>
  )
}

export default App;