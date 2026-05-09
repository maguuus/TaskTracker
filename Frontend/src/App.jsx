import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { Home } from './pages/Home';
import { Board } from './pages/Board';
import { Login } from './pages/Login';

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() { {/* Тело возвращаемого документа*/}

  return (
    <BrowserRouter> {/* Активирует возможности Routes */}
    {/* Панель сверху - <Link={куда отправляет надпись}>{слово}</Link>  */}
      <nav class="container-fluid bg-dark text-light pt-3"> 
        {/* Настройки: контейнер, который заполняет всю ширину, background-color = dark, text-color = light, padding top = 3 (макс 5)  */}
        Task Tracker:{" "}
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/board">Board</Link>
      </nav>

      {/* Смотрит какой сейчас endpoint, и на место соотвествующего подставляет результат функции {element} */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
