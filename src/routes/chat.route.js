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

      socket.on('signIn', (data) => {
        // On stocke la personne avec son pseudo en clef, son id de socket en param
        if (data.pseudo) {
          this.usersConnected[data.pseudo] = { socketId: socket.id };
        } else {
          // On envoie un petit signal au client pour lui dire que c'est la merde
          // TODO
        }
      });

      socket.on('sendMessage', (data) => {
        // Si la personne est connectée on lui envoie immédiatement
        const dest = this.usersConnected[data.dest];
        if (dest) {
          this.io.to(`${dest.socketId}`).emit('message', { exp: data.exp, message: data.message });
        }
        // On stocke dans la base de donnée le message
        // TODO
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
