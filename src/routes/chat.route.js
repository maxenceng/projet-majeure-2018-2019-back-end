export default class ChatRoutes {
  constructor(io) {
    this.io = io;
    this.usersConnected = {};
  }

  initRoutes() {
    this.io.on('connection', (socket) => {
      socket.on('connection', () => {

      });

      socket.on('signIn', (data) => {
        // On stocke la personne avec son pseudo en clef, son id de socket en param
        this.usersConnected[data.userName] = { socket: socket.id };
      });

      socket.on('sendMessage', (data) => {
        // Si la personne est connectée on lui envoie immédiatement
        // On stocke dans la base de donnée le message
      });

      socket.on('disconnect', () => {
        // On retire la personne des personnes connectées
      });
    });
  }
}
