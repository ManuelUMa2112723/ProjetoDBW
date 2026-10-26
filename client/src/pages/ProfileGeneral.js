import React, { useEffect, useState } from 'react';
import './ProfilePage.css';

function ProfileGeneral() {
  const [userName, setUserName] = useState('');
  const [numSessoes, setNumSessoes] = useState(0);

  useEffect(() => {
    // Buscar nome do utilizador
    fetch('http://localhost:3000/api/user', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Utilizador não autenticado');
        return res.json();
      })
      .then(data => {
        setUserName(data.username);
      })
      .catch(err => {
        console.error('Erro ao obter utilizador:', err);
        setUserName('Desconhecido');
      });

    // Buscar número de sessões
    fetch('http://localhost:3000/api/user/sessoes', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao obter sessões');
        return res.json();
      })
      .then(data => {
        setNumSessoes(data.total);
      })
      .catch(err => {
        console.error('Erro ao obter número de sessões:', err);
      });
  }, []);

  return (
    <main className="profile-content">
      <div className="info-box">
        <p>Nome do utilizador: <strong>{userName || 'A carregar...'}</strong></p>
      </div>
      <div className="info-box">
        <p>Número de sessões: <strong>{numSessoes}</strong></p>
      </div>
    </main>
  );
}

export default ProfileGeneral;
