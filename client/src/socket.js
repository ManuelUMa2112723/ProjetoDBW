import { io } from "socket.io-client";


const socket = io("http://localhost:3000", { // instância de socket ligada ao servidor que está a correr em localhost:3000
  transports: ["websocket"], //garante rapidez e estabilidade
  withCredentials: true,
  autoConnect: false,          
});

export default socket;
