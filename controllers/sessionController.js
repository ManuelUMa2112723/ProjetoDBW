const Session = require('../models/Session');

exports.createSession = async (req, res) => {
  console.log('createSession - req.body:', req.body);

  const { theme, ideas, result, user, players } = req.body;
  let userId = null;

  //Se veio pelo Passport (autenticado via browser)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    userId = req.user._id;
  }

  //Se for requisição interna com um user manualmente incluído
  if (!userId && user) {
    userId = user;
  }

  //Se ainda não há userId, mas temos jogadores, usa o primeiro válido
  if (!userId && Array.isArray(players) && players.length > 0) {
    userId = players[0];
  }

  if (!theme || !ideas || !result) {
    console.error('Campos obrigatórios faltando. Dados recebidos:', req.body);
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  if (!userId) {
    console.warn('Nenhum utilizador identificado para associar à sessão. Salva sem campo "user".');
  }

  try {
    const newSession = new Session({
      theme,
      ideas,
      result,
      user: userId || undefined,
      createdAt: new Date()
    });

    const savedSession = await newSession.save();
    console.log('Sessão criada com sucesso:', savedSession);
    res.status(201).json(savedSession);
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro interno ao criar sessão' });
  }
};


exports.getSessions = async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    console.error('Utilizador não autenticado na listagem de sessões');
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const sessions = await Session.find({ "players.user": req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Erro ao recuperar sessões:', error);
    res.status(500).json({ error: 'Erro interno ao recuperar sessões' });
  }
};

