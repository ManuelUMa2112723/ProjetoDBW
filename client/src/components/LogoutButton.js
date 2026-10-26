// src/components/LogoutButton.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
 import './LogoutButton.css'; 
 
function LogoutButton() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/logout', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        setUser(null);
        navigate('/login');
      } else {
        console.error('Erro ao efetuar logout');
      }
    } catch (error) {
      console.error('Erro na conexão para logout:', error);
    }
  };

  return (
    <button  className="logout" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
