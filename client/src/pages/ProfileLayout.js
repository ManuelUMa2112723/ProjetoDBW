import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './ProfilePage.css';

function ProfileLayout() {
  const [userImage, setUserImage] = useState('');
  const [updateTrigger, setUpdateTrigger] = useState(0); //  dispara o useEffect

  useEffect(() => {
    fetch('http://localhost:3000/api/user', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setUserImage(`http://localhost:3000${data.image}`);
      })
      .catch(err => {
        console.error('Erro ao carregar imagem do utilizador:', err);
      });
  }, [updateTrigger]); //  refaz fetch quando updateTrigger muda

 
  useEffect(() => {
    const listener = () => setUpdateTrigger(t => t + 1);
    window.addEventListener('avatarUpdated', listener);
    return () => window.removeEventListener('avatarUpdated', listener);
  }, []);

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="header-left">Geral</div>
        <div className="header-center">StormMind</div>
        <div className="header-right">
          {userImage ? (
            <img src={userImage} alt="Avatar" className="user-avatar" />
          ) : (
            <span className="user-icon">👤</span>
          )}
        </div>
      </header>

      <nav className="profile-menu">
        <Link to="/profile"><button>Geral</button></Link>
        <Link to="/profile/sessions"><button>Sessões</button></Link>
        <Link to="/profile/config"><button>Config.</button></Link>
      </nav>

      <Outlet />
    </div>
  );
}

export default ProfileLayout;
