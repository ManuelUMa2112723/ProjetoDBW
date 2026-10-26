// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';
import socket from "../socket";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();      //  Espera o utilizador dar resposta
        setUser(data.user);                      //  Guarda o utilizador
        socket.connect();                        //  Só agora conecta o socket
        navigate('/');                           //  Redireciona depois
      }
      
       else {
        const data = await response.json();
        setError(data.message || 'Falha no login');
      }

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro na conexão');
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Utilizador</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o seu username"
              required 
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a sua senha"
              required 
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="login-button">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
