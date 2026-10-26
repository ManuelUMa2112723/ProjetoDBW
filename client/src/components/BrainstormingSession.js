import React, { useState, useEffect, useCallback } from 'react';
import './BrainstormingSession.css';

function BrainstormingSession() {
   
  const [theme, setTheme] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [currentIdea, setCurrentIdea] = useState('');
  const [timeLeft, setTimeLeft] = useState(10); // tempo em segundos
  const [sessionStarted, setSessionStarted] = useState(false);
  const [result, setResult] = useState(null);

  // Função para salvar a sessão no backend, memorizada com useCallback
  const saveSession = useCallback(async (theme, ideas, result) => {
    try {
      const response = await fetch('/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, ideas, result })
      });
      if (!response.ok) {
        console.error('Erro ao salvar sessão:', await response.text());
      } else {
        console.log('Sessão salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao chamar /session/create:', error);
    }
  }, []); // Nenhuma dependência externa

  // Função para processar e enviar as ideias para a API do LM Studio, memorizada com useCallback
  const processIdeas = useCallback(async () => {
    const prompt = `Tema: ${theme}\nIdeias: ${ideas.join(', ')}\nCrie uma solução coerente baseada nestas ideias.`;
    try {
      const response = await fetch('/api/lmstudio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setResult(data);
      await saveSession(theme, ideas, data);
    } catch (error) {
      console.error('Erro ao processar as ideias:', error);
    }
  }, [theme, ideas, saveSession]);

  // useEffect para controlar o contador regressivo
  useEffect(() => {
    let timer;
    if (sessionStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (sessionStarted && timeLeft === 0) {
      clearInterval(timer);
      processIdeas();
    }
    return () => clearInterval(timer);
  }, [sessionStarted, timeLeft, processIdeas]);

  // Inicia a sessão: reinicia timer, limpa ideias e resultado
  const handleStartSession = () => {
    setSessionStarted(true);
    setTimeLeft(10);
    setIdeas([]);
    setResult(null);
  };

  // Adiciona uma nova ideia
  const handleAddIdea = () => {
    if (currentIdea.trim() !== '') {
      setIdeas([...ideas, currentIdea]);
      setCurrentIdea('');
    }
  };

  return (
    <div className="brainstorm-container">
      <h2 className="section-title">Sessão de Brainstorming</h2>
      {!sessionStarted ? (
        <div className="session-init">
          <label className="input-label">
            Tema / Problema a resolver:
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input-field"
            />
          </label>
          <button onClick={handleStartSession} disabled={!theme} className="btn primary-btn">
            Submeter Tema
          </button>
        </div>
      ) : (
        <div className="session-active">
          <div className="timer">
            <h3>
              Tempo restante: <span>{timeLeft} segundos</span>
            </h3>
          </div>
          {timeLeft > 0 && (
            <div className="idea-input-area">
              <input
                type="text"
                placeholder="Digite uma ideia..."
                value={currentIdea}
                onChange={(e) => setCurrentIdea(e.target.value)}
                className="input-field"
              />
              <button onClick={handleAddIdea} className="btn secondary-btn">
                Adicionar Ideia
              </button>
              <div className="ideas-list">
                <h4>Ideias submetidas:</h4>
                <ul>
                  {ideas.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {timeLeft === 0 && !result && <p className="processing-msg">A processar as ideias...</p>}
          {result && (
            <div className="result-area">
              <h3>Resultado da AI:</h3>
              <div className="result-area">
  
  <div className="ai-response">
    {result?.choices?.[0]?.text
      .split('\n')
      .map((line, index) => (
        <p key={index}>{line}</p>
      ))}
  </div>
</div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrainstormingSession;
