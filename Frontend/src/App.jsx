import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { Home } from './pages/Home';
import { Board } from './pages/Board';
import { Login } from './pages/Login';

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

function App() {

  return (
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
  )
}

export default App
