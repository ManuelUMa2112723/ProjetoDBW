import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrainstormingSession from './components/BrainstormingSession';
import LogoutButton from './components/LogoutButton';
import ProfileLayout from './pages/ProfileLayout';
import ProfileGeneral from './pages/ProfileGeneral';
import SessionsPage from './pages/SessionsPage';
import ProfileConfig from './pages/ProfileConfig';
import RoomsList from './pages/RoomsList';
import RoomPage from './pages/RoomPage';
import socket from './socket';

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('registerUser', { userId: user._id });
      console.log('userId emitido para socket:', user._id);
    }
  }, [user]);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/profile">Perfil</Link>
        <Link to="/salas">Salas</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Registar</Link>
        <LogoutButton />
      </nav>

      <div className="main-container">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>
                  <h1>Plataforma de Brainstorming</h1>
                  <div className="section">
                    <BrainstormingSession />
                  </div>
                  <div className="section">
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          

          <Route path="/profile/*" element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
            <Route index element={<ProtectedRoute><ProfileGeneral /></ProtectedRoute>} />
            <Route path="sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
            <Route path="config" element={<ProtectedRoute><ProfileConfig /></ProtectedRoute>} />
          </Route>

          <Route
            path="/salas"
            element={
              <ProtectedRoute>
                <RoomsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<h2>Página não encontrada</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
