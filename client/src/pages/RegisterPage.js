// RegisterPage.js
import React, { useState } from 'react';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import socket from "../socket";

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();      // Aguarda confirmação
        socket.connect();                        // Conecta só depois de registar
        navigate('/login');                      // Redireciona para o login
      }
      
       else {
        const data = await response.json();
        setError(data.message || 'Falha no registo');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro na conexão');
    }
  }
  

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registo</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
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
          <button type="submit" className="register-button">Registar</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
