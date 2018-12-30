// eslint-disable-next-line no-console
import express from 'express';
import http from 'http';
import io from 'socket.io';
import DBConnexion from './src/middlewares/dbConnexion';
import defaultRouter from './src/routes/default.route';
import authRouter from './src/routes/authentification.route';

// TODO
// process.env.CONFIG = JSON.stringify(CONFIG);

class Server {
  constructor(port) {
    this.app = express();
    const server = http.createServer(this.app);
    this.io = io(server);
    this.app.listen(port, () => {
      // this.initDB();
      this.initRoutesREST();
    });
  }

  initDB() {
    this.db = new DBConnexion();
    this.db.test();
  }

  initRoutesREST() {
    this.app.use(defaultRouter);
    this.app.use(authRouter);
  }
}

const server = new Server(3000);
