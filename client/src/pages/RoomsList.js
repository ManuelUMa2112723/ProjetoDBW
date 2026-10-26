import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import './RoomsList.css';

function RoomsList() {
  const [rooms, setRooms] = useState({});
  const [theme, setTheme] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('roomsList', (roomsData) => {
      console.log('Lista de salas recebida:', roomsData);
      setRooms(roomsData);
    });

    socket.on('roomCreated', ({ roomId }) => {
      console.log('Sala criada:', roomId);
      navigate(`/room/${roomId}`);
    });

    socket.on('roomJoined', ({ roomId }) => {
      console.log('Entrou na sala:', roomId);
      navigate(`/room/${roomId}`);
    });

    socket.emit('getRooms');

    return () => {
      socket.off('roomsList');
      socket.off('roomCreated');
      socket.off('roomJoined');
    };
  }, [navigate]);

  const handleCreateRoom = () => {
    if (theme.trim()) {
      console.log('Criando sala com tema:', theme);
      socket.emit('createRoom', { theme });
      setTheme('');
    }
  };

  const handleJoinRoom = (roomId) => {
    console.log('Solicitando entrada na sala:', roomId);
    socket.emit('joinRoom', { roomId });
  };

  return (
    <div className="rooms-container">
      <h2>Salas Disponíveis</h2>
      <div className="create-room">
        <input
          className="input-field"
          type="text"
          placeholder="Tema da sala"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <button className="btn" onClick={handleCreateRoom}>Criar Sala</button>
      </div>

      <div className="rooms-list">
        {Object.keys(rooms).length === 0 ? (
          <p>Nenhuma sala disponível</p>
        ) : (
          Object.entries(rooms).map(([id, room]) => {
            const isJoinable = room.players.length === 1 && !room.players.includes(socket.id);

            return (
              <div key={id} className="room-card">
                <p><strong>Tema:</strong> {room.theme}</p>
                <p><strong>Jogadores:</strong> {room.players.length}/2</p>
                {isJoinable && (
                  <button className="btn" onClick={() => handleJoinRoom(id)}>
                    Entrar na Sala
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RoomsList;
