const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Middleware para verificar se está logado
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.redirect('/auth/login');
}

// Rota protegida para criar uma nova sessão
router.post('/create', ensureAuthenticated, sessionController.createSession);

// Rota protegida para listar as sessões do utilizador autenticado
router.get('/', ensureAuthenticated, sessionController.getSessions);

//Rota aberta para salvar sessão via servidor
router.post('/create_internal', sessionController.createSession);
// Rota interna sem autenticação (usada apenas pelo servidor)
router.post('/create_internal', sessionController.createSession);

module.exports = router;

