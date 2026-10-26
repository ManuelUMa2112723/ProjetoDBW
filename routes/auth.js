const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

 

//Processa login
router.post('/login', (req, res, next) => {    //rota POST, quando no frontend envia as informaçoes de login, esta funçao é chamada.
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);   //se houver erro tecnico, passa para o middleware seguinte
    if (!user) {  //se utilizador nao foi autenticado (palavra passe ou username errado)
      return res.status(401).json({ message: info?.message || 'Falha no login' });
    }
    req.logIn(user, (err) => {  //se utilizador for autenticado com sucesso
      if (err) return next(err); 
      
      return res.json({ message: 'Login efetuado com sucesso', user: req.user });
    });
  })(req, res, next); 
});



 

// Processa o registo
router.post('/register', async (req, res) => {
  const { username, password } = req.body; //json para extrair o username e password enviado pelo frontend
  try {
    //verificar se o utilizador já existe
    const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      return res.status(409).json({ message: 'Utilizador já existe' });
    }

    const newUser = new User({ username, password });  //objeto user com os dados recebidos pelo frontend
    await newUser.save();

    
    return res.status(201).json({ message: 'Utilizador registado com sucesso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao registar' });
  }
});



// Rota para logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao efetuar logout' });
    }
    return res.json({ message: 'Logout efetuado com sucesso' });
  });
});

// Verifica se o utilizador está autenticado
router.get('/check', (req, res) => {  //é chamada pelo frontend quando a pagina carrega ou para mostrar o perfil.
  if (req.isAuthenticated()) {  //devolve True se utilizador esta autenticado
    return res.json({ user: req.user }); //envia os dados do utilizador armazenados em req.user
  } else {
    return res.status(401).json({ message: 'Não autenticado' });
  }
});


module.exports = router;