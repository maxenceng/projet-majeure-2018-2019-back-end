import chat from '../services/db.service';

export default class ChatRoutes {
  constructor(io) {
    this.io = io;
    this.usersConnected = {};
  }

  initRoutes() {
    this.io.on('connection', (socket) => {
      socket.on('connection', () => {
        console.log(`New WebSocket Client : ${socket.id}`);
      });

      socket.on('chatConnection', (data) => {
        // On stocke la personne avec son email en clef, son id de socket en param
        if (data.email) {
          this.usersConnected[data.email] = { socketId: socket.id };
        } else {
          // On envoie un petit signal au client pour lui dire que c'est la merde
          // TODO
        }
      });

      socket.on('sendMessage', (data) => {
        // Si la personne est connectée on lui envoie immédiatement
        const dest = this.usersConnected[data.destEmail];
        if (dest) { this.io.to(`${dest.socketId}`).emit('message', { exp: data.exp, message: data.message }); }
        const cb = (err) => {
          if (err) { return socket.emit('sendMessage', { error: 'Not able to send message' }); }
          return socket.emit('sendMessage', { message: 'Message well sent' });
        };
        // Stockage base de données
        chat.createMessage(data.message, data.exp, data.dest, cb);
      });

      socket.on('disconnect', () => {
        // On retire la personne des personnes connectées
        let userDisconnected;
        const keys = Object.keys(this.usersConnected);
        keys.forEach((key) => {
          if (this.usersConnected[key].socketId === socket.id) {
            delete this.usersConnected[key];
          }
        });
      });
    });
  }
}
