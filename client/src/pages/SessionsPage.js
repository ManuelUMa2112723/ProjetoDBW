import React, { useState, useEffect, useContext } from 'react';
import './SessionsPage.css';
import { AuthContext } from '../context/AuthContext';

function SessionsPage() {
  const { user } = useContext(AuthContext);
  const [sessionsData, setSessionsData] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/session', {
          credentials: 'include' // garante que o cookie é enviado
        });
        const data = await response.json();
        setSessionsData(data);
      } catch (error) {
        console.error('Erro ao buscar sessões:', error);
      }
    };

    fetchSessions();
  }, []);

  return (
    <main className="sessions-content">
      {sessionsData.length > 0 ? (
        sessionsData.map((session, index) => {
          console.log('Sessão:', session);
          console.log('Jogadores da sessão:', session.players);
          console.log('Utilizador logado:', user);

          const userId = String(user?._id);
          const userPlayer = session.players?.find(p => String(p.user) === userId);
          const opponentPlayer = session.players?.find(p => String(p.user) !== userId);
          const isWinner = session.winner && String(session.winner) === userId;
          const isLoser = session.loser && String(session.loser) === userId;

          return (
            <div key={index} className="session-card">
              <h3><strong>Tema:</strong> {session.theme}</h3>

              <div className="response-box">
                <h4>Resposta Utilizador:</h4>
                <p>{userPlayer ? userPlayer.ideas?.join(', ') : '[sem utilizador correspondente]'}</p>
              </div>

              <div className="response-box">
                <h4>Resposta Adversário:</h4>
                <p>{opponentPlayer ? opponentPlayer.ideas?.join(', ') : '[sem adversário encontrado]'}</p>
              </div>

              <div className="response-box">
                <h4>Resposta AI:</h4>
                <p>{session.result?.choices?.[0]?.text || 'Sem resposta da IA'}</p>
              </div>

              <div className="response-box">
                <h4>Resultado:</h4>
                {isWinner && <p style={{ color: 'green', fontWeight: 'bold' }}>Vitória</p>}
                {isLoser && <p style={{ color: 'red', fontWeight: 'bold' }}>Derrota</p>}
                {!isWinner && !isLoser && <p style={{ color: 'gray' }}>Empate ou indefinido</p>}
              </div>
            </div>
          );
        })
      ) : (
        <p>Carregando sessões...</p>
      )}
    </main>
  );
}

export default SessionsPage;
