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
      console.log('new connection');
      socket.on('connection', () => {
        console.log(`New WebSocket Client : ${socket.id}`);
        socket.emit('connection', 'connection ok');
      });

      socket.on('chatConnection', (data) => {
        console.log('chat connection', data);
        // On stocke la personne avec son email en clef, son id de socket en param
        if (data.idUser) {
          this.usersConnected[data.idUser] = { socketId: socket.id };
          socket.emit('chatConnection', { message: 'Connexion Chat success', users: this.usersConnected });
        } else {
          socket.emit('chatConnection', { err: 'Connexion Chat Error, No iduser found' });
        }
      });

      socket.on('sendMessage', async (data) => {
        // Si la personne est connectée on lui envoie immédiatement
        if (!data.idDest) { return socket.emit({ err: 'No id for receiver found' }); }
        const dest = this.usersConnected[data.idDest];
        if (dest) { this.io.to(`${dest.socketId}`).emit('message', { exp: data.exp, message: data.message }); }
        // Stockage base de données
        try {
          await dbService.createMessage(data.message, data.exp, data.idDest);
          return socket.emit('sendMessage', { message: 'Message well send', data });
        } catch (e) {
          return socket.emit('sendMessage', { err: 'Error when saving message in database' });
        }
      });

      socket.on('disconnect', () => {
        // On retire la personne des personnes connectées
        console.log('disconnected');
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
