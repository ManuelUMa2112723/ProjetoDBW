require('dotenv').config();

const fetch = require('node-fetch');
const Session = require('./models/Session');

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const multer = require('multer');
const rooms = {};


const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGODB_URI || !SESSION_SECRET) {
  throw new Error('Configura MONGODB_URI e SESSION_SECRET no ficheiro .env.');
}
// Importa o modelo de utilizador (a ser criado em models/User.js)
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {   //instância do Socket.IO ligada ao servidor HTTP
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true 
  }
});



// Conexão com o MongoDB
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Erro na conexão com o MongoDB:', err));
  
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001', // Porta do React
  credentials: true //envio de cookies de sessão
}));
 
// Middlewares para leitura de JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Criar uma variável com o middleware de sessão
// Criar middleware de sessão
const expressSession = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI })
});







app.use(expressSession); //middleware express-session nas rotas HTTP normais
io.use((socket, next) => { //partilhar a sessão entre HTTP e WebSocket
  expressSession(socket.request, {}, next);
});


// Inicialização do Passport
app.use(passport.initialize()); //inicializa passport na app Express
app.use(passport.session());  //permite ao utilizador ficar autenticado entre pedidos


passport.use(new LocalStrategy(  //funçao chamada sempre que alguem fizer login
  async (username, password, done) => { //comunica o resultado
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) return done(null, false, { message: 'Utilizador não encontrado' });

      const isMatch = await bcrypt.compare(password, user.password); //desencripta e compara a password fornecida com a password guardada na BD
      if (!isMatch) return done(null, false, { message: 'Senha incorreta' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));



passport.serializeUser((user, done) => {  //como guardar o utilizador na sessão após o login
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {  //como recuperar o utilizador a partir do ID guardado na sessão
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Servir arquivos estáticos (CSS, JS, imagens, etc.)
app.use(express.static(path.join(__dirname, 'public')));



// Rotas de autenticação  
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      username: req.user.username,
      image: req.user.image
    });
  } else {
    return res.status(401).json({ error: 'Não autenticado' });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `${req.user._id}.${ext}`);
  }
});

const upload = multer({ storage });

app.post('/api/user/upload-avatar', upload.single('avatar'), async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Não autenticado' });

  const imagePath = `/uploads/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { image: imagePath });
  res.json({ success: true, image: imagePath });
});

app.get('/api/user/sessoes', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const count = await Session.countDocuments({ 'players.user': req.user._id });
    res.json({ total: count });
  } catch (err) {
    console.error('Erro ao contar sessões:', err);
    res.status(500).json({ error: 'Erro ao contar sessões' });
  }
});



 

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
// Rotas da API (LM Studio)
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const sessionRoutes = require('./routes/session');
app.use('/session', sessionRoutes);





function generateRoomId() {
  return Math.random().toString(36).substr(2, 9);
}

// Função para processar as ideias 
async function processIdeas(theme, ideiasPorSocket, playerSocketIds, callback) {
  const [playerA, playerB] = playerSocketIds;
  const ideasA = ideiasPorSocket[playerA] || [];
  const ideasB = ideiasPorSocket[playerB] || [];

  const prompt = `
Tema: ${theme}

Ideias do Jogador A: ${ideasA.join(', ')}

Ideias do Jogador B: ${ideasB.join(', ')}

Baseando-se nessas ideias, escreva uma resposta criativa ao tema.

No final, escreve APENAS uma letra sozinha numa linha nova: A ou B.

Não expliques a escolha. Apenas a letra. Por exemplo:
A
`.trim();




  try {
    const response = await fetch('http://localhost:3000/api/lmstudio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
const aiText = data?.choices?.[0]?.text?.toLowerCase() || '';

console.log('Resposta da IA:\n', aiText);

// Apanha todas as letras isoladas no final (A ou B)
const matches = aiText
  .split('\n')
  .map(line => line.trim().toLowerCase())
  .filter(line => line.match(/^([ab])$/)); // só aceita "a" ou "b" isolado


  const lastValidAnswer = matches.length > 0 ? matches[matches.length - 1] : null;

let winnerSocketId = null;
if (lastValidAnswer === 'a') {
  winnerSocketId = playerA;
} else if (lastValidAnswer === 'b') {
  winnerSocketId = playerB;
}

const loserSocketId =
  winnerSocketId === playerA ? playerB :
  winnerSocketId === playerB ? playerA :
  null;

    



    callback(data, winnerSocketId, loserSocketId);
  } catch (error) {
    console.error('Erro ao processar as ideias:', error);
    callback(null, null, null);
  }
}


//aceita novos clientes e define os eventos que vai escutar para cada socket
io.on('connection', (socket) => {
  console.log('Novo utilizador conectado:', socket.id);
  socket.on('getRooms', () => {
    socket.emit('roomsList', rooms);
  });
  
  // Criação de uma sala
  socket.on('createRoom', ({ theme }) => {
    const roomId = generateRoomId(); //ID único para a sala
    rooms[roomId] = { theme, players: [socket.id], ideas: {} };
    
socket.join(roomId); //coloca socket do utiizador nessa sala especifica


const userId = socket.request?.session?.passport?.user || null; // obter o ID do utilizador autenticado que está ligado via socket com base na sessão ativa
socket.userId = userId; 
rooms[roomId].playerUserIds = {}; //nova propriedade dentro da sala roomID
rooms[roomId].playerUserIds[socket.id] = userId; //socket do jogador == id de utilizador
console.log("userId atribuído no createRoom:", socket.userId);

    io.emit('roomsList', rooms); //atualiza a lista de rooms para todos os clientes 
    socket.emit('roomCreated', { roomId, theme }); //envia este evento para o criador da sala
    console.log(`Sala ${roomId} criada com tema: ${theme}`);
  });

  // Entrada em uma sala existente
  socket.on('joinRoom', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return; //se o roomId não existe (sala apagada ou inválida) simplesmente não faz nada
  
    // Adiciona socket à sala
    if (!room.players.includes(socket.id)) {  //se ainda nao existir um jogador com o socket.id que ja esteja incluido
      room.players.push(socket.id); // registo dos jogadores ligados à sala
      socket.join(roomId); //adiciona novo socket na sala(jogador2)
  
      
      const userId = socket.request?.session?.passport?.user || null; //repetir o mesmo processo mas agora para o novo socket do joinroom
      socket.userId = userId;
      room.playerUserIds = room.playerUserIds || {};
room.playerUserIds[socket.id] = userId;

      console.log(" userId atribuído no joinRoom:", socket.userId);

  
      console.log(` Socket ${socket.id} entrou na sala ${roomId} com userId: ${userId}`);
    }
  
    console.log(`Jogadores atuais na sala ${roomId}:`, room.players);
  
    const connectedPlayers = room.players.filter(id => io.sockets.sockets.get(id));  //manter apenas aqueles cujos sockets ainda estão conectados
    if (connectedPlayers.length === 2) {
      console.log(` Sala ${roomId} completa. Enviando startSession`);
      io.in(roomId).emit('roomJoined', { roomId, theme: room.theme });  //evento roomJoined para todos os sockets dentro da sala roomId
      io.in(roomId).emit('startSession', {
        theme: room.theme,
        initialTime: 10
      });
      io.emit('roomsList', rooms);  //para atualizar o lobby caso uma sala ja nao esteja disponivel
    } else {
      socket.emit('forceSyncRoom', { //forceSyncRoom para exibir a interface de espera
        theme: room.theme,
        waiting: true
      });
    }
  });
  
  
  
  
  
  
  // Recebe ideia enviada por um jogador e passa para o adversário
  socket.on('localIdea', ({ roomId, idea }) => {
    if (!rooms[roomId].ideas[socket.id]) {
      rooms[roomId].ideas[socket.id] = [];
    }
    rooms[roomId].ideas[socket.id].push(idea);
    socket.to(roomId).emit('remoteIdea', idea);
    console.log(`Ideia recebida em sala ${roomId} de ${socket.id}: ${idea}`);
  });

  //Quando o tempo termina, as ideias são enviadas
  socket.on("submitIdeas", async ({ roomId, ideas }) => {
    //guarda localmente as ideias do socket actual
    rooms[roomId].ideas[socket.id] = ideas;
  
    
    if (
      Object.keys(rooms[roomId].ideas).length === 2 &&
      !rooms[roomId].processed
    ) {
      rooms[roomId].processed = true;           
      const allIdeas = Object.values(rooms[roomId].ideas).flat();
  
      processIdeas(rooms[roomId].theme, rooms[roomId].ideas, rooms[roomId].players, async (result, winnerSocketId, loserSocketId) => {

            /*envia resposta IA e o resultado*/
    const outcome = {};
    if (winnerSocketId && loserSocketId) {
      outcome[winnerSocketId] = "vitoria";
      outcome[loserSocketId]  = "derrota";
    } else {
      // se a IA não escolher A/B → empate
      rooms[roomId].players.forEach(id => (outcome[id] = "empate"));
    }

    io.in(roomId).emit("sessionResult", {
      ai      : result,        // resposta original da IA
      outcome,                 // { socketId:"vitoria" | "derrota" | "empate" }
      winnerSocketId,
      loserSocketId
    });

  
        /*GRAVA NO MONGODB*/
        try {
          const playerData = rooms[roomId].players.map((id) => ({
            user:
              io.sockets.sockets.get(id)?.request?.session?.passport?.user ||
              null,                            // pode vir a null
            ideas: rooms[roomId].ideas[id] || [],
          }));

          const winnerUser = rooms[roomId].playerUserIds?.[winnerSocketId] || null;
          const loserUser = rooms[roomId].playerUserIds?.[loserSocketId] || null;
          
          
          console.log('Vencedor socketId:', winnerSocketId);
          console.log('User vencedor:', winnerUser);
          console.log('Perdedor socketId:', loserSocketId);
          console.log('User perdedor:', loserUser);

  
          await new Session({
            theme: rooms[roomId].theme,
            players: playerData,
            result,
            winner: winnerUser,
            loser: loserUser,
            createdAt: new Date(),
          }).save();
          
  
          console.log("Sessão gravada no MongoDB");
        } catch (err) {
          console.error("Erro ao gravar sessão:", err);
        }
  
        delete rooms[roomId];                  
      });
    }
  });
  
 
  
  // Trata da desconexão e limpa a sala se necessário
  socket.on('disconnect', () => {
    console.log('Utilizador desconectado:', socket.id);
    for (const roomId in rooms) {
      if (rooms[roomId].players.includes(socket.id)) {
        rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
        delete rooms[roomId].ideas[socket.id];
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
        io.emit('roomsList', rooms);
      }
    }
  });
});