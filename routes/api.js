const express = require('express');
const router = express.Router();
const lmController = require('../controllers/lmController');

// Rota para receber o prompt e retornar o conteúdo gerado pela LM Studio API
router.post('/lmstudio', lmController.getContent);

module.exports = router;
