import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import './RoomPage.css';

function RoomPage() {
  const { roomId } = useParams();
  const [theme, setTheme] = useState('');
  const [localIdeas, setLocalIdeas] = useState([]);
  const [remoteIdeas, setRemoteIdeas] = useState([]);
  const [currentIdea, setCurrentIdea] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [result, setResult] = useState(null);
const [matchResult, setMatchResult] = useState(null);   // "vitoria" | "derrota" | "empate"

  // Envia joinRoom quando entra nesta página
  useEffect(() => {
    console.log('Entrando na sala via socket:', roomId);
    socket.emit('joinRoom', { roomId });
  }, [roomId]);

  useEffect(() => {
    // Quando sessão começa
    socket.on('startSession', (data) => {
      console.log('startSession recebido:', data);
      setTheme(data.theme);
      setSessionStarted(true);
      setTimeLeft(data.initialTime);
    });

    socket.on('remoteIdea', (idea) => {
      setRemoteIdeas(prev => [...prev, idea]);
    });

   socket.on('sessionResult', ({ ai, outcome }) => {
  console.log('Resultado da IA:', ai, outcome);
  setResult(ai);                       // mantém o texto da IA
  setMatchResult(outcome[socket.id]);  // guarda vitória / derrota / empate
});


    socket.on('forceSyncRoom', (data) => {
      console.log('Sincronização recebida (forceSyncRoom):', data);
      if (data.theme) {
        setTheme(data.theme);
      }
    });

    return () => {
      socket.off('startSession');
      socket.off('remoteIdea');
      socket.off('sessionResult');
      socket.off('forceSyncRoom');
    };
  }, [roomId]);

  useEffect(() => {
    let timer;
    if (sessionStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (sessionStarted && timeLeft === 0 && !result) {
      clearInterval(timer);
      console.log('Tempo terminou, enviando ideias:', localIdeas);
      socket.emit('submitIdeas', { roomId, ideas: localIdeas });
    }
    return () => clearInterval(timer);
  }, [sessionStarted, timeLeft, localIdeas, roomId, result]);

  const handleAddIdea = () => {
    if (currentIdea.trim() !== '') {
      setLocalIdeas(prev => [...prev, currentIdea]);
      socket.emit('localIdea', { roomId, idea: currentIdea });
      setCurrentIdea('');
    }
  };

  return (
    <div className="room-container-page">
      <h2>Sala: {roomId}</h2>
      {theme && <h3>Tema da Sessão: {theme}</h3>}

      {!sessionStarted ? (
        <p className="waiting-msg">Aguardando que a sala seja completa para iniciar a sessão...</p>
      ) : (
        <div className="session-active">
          <div className="timer">
            <h3>Tempo restante: {timeLeft} segundos</h3>
          </div>

          <div className="ideas-area">
            <div className="input-area">
              <h4>Sua Ideia:</h4>
              <input
                type="text"
                placeholder="Digite sua ideia..."
                value={currentIdea}
                onChange={(e) => setCurrentIdea(e.target.value)}
                className="input-field"
              />
              <button onClick={handleAddIdea} className="btn">Adicionar Ideia</button>
              <div className="ideas-list">
                <h5>Suas Ideias:</h5>
                <ul>
                  {localIdeas.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="input-area">
              <h4>Ideias do Adversário:</h4>
              <div className="ideas-list">
                <ul>
                  {remoteIdeas.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {timeLeft === 0 && !result && (
            <p className="processing-msg">Processando ideias...</p>
          )}

          {result && (
            <div className="result-area">
              <h3>Resultado da IA:</h3>
              <div className="ai-result-box">
  {result?.choices?.[0]?.text || 'Resultado indisponível'}
</div>
{matchResult && (
  <p className="match-tag">
    {matchResult === "vitoria" ? "Vitória!"
      : matchResult === "derrota" ? "Derrota."
      : "Empate."}
  </p>
)}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomPage;
