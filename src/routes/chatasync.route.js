import dbService from '../services/db.service';

export default class ChatRoutes {
  constructor(io) {
    this.io = io;
    this.usersConnected = {};
    this.initRoutes();
  }

  initRoutes() {
    console.log('socket.io started!!');
    this.io.on('connection', (socket) => {
      socket.on('connection', () => {
        console.log(`New WebSocket Client : ${socket.id}`);
      });

      socket.on('chatConnection', (data) => {
        // On stocke la personne avec son email en clef, son id de socket en param
        if (data.idUser) {
          this.usersConnected[data.idUser] = { socketId: socket.id };
          socket.emit({ message: 'Connexion Chat success' });
        } else {
          socket.emit({ err: 'Connexion Chat Error, No iduser found' });
          // On envoie un petit signal au client pour lui dire que c'est la merde
          // TODO
        }
      });

      socket.on('sendMessage', async (data) => {
        // Si la personne est connectée on lui envoie immédiatement
        if (!data.idDest) { return socket.emit({ err: 'No id for receiver found' }); }
        const dest = this.usersConnected[data.idDest];
        if (dest) { this.io.to(`${dest.socketId}`).emit('message', { exp: data.exp, message: data.message }); }
        // Stockage base de données
        try {
          await dbService.createMessage(data.message, data.exp, data.dest);
          return socket.emit('sendMessageRet', { message: 'Message well send' });
        } catch (e) {
          return socket.emit('sendMessageRet', { err: 'Error when saving message in database' });
        }
      });

      socket.on('disconnect', () => {
        // On retire la personne des personnes connectées
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
