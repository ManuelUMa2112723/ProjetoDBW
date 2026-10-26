import React, { useEffect, useState } from 'react';
import './ProfileConfig.css';

function ProfileConfig() {
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/user', {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Utilizador não autenticado');
        return res.json();
      })
      .then(data => {
        setUserName(data.username);
        setUserImage(`http://localhost:3000${data.image}`);
      })
      .catch(err => {
        console.error('Erro ao obter utilizador:', err);
        setUserName('Desconhecido');
      });
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      const res = await fetch('http://localhost:3000/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Erro ao fazer upload da imagem');

      const data = await res.json();
      const newImage = `http://localhost:3000${data.image}`;
      setUserImage(newImage);

      //  Notifica o layout que o avatar foi atualizado
      window.dispatchEvent(new Event('avatarUpdated'));
    } catch (err) {
      console.error('Erro ao carregar imagem:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="config-content">
      <div className="config-box">
        <p>Nome do utilizador: <strong>{userName || 'A carregar...'}</strong></p>
      </div>

      <div className="config-box">
        <p>Imagem de perfil:</p>
        {userImage && <img src={userImage} alt="Avatar" className="avatar-preview" />}
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {uploading && <p>A carregar imagem...</p>}
      </div>
    </main>
  );
}

export default ProfileConfig;
