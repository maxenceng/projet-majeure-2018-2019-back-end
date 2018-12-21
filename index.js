// eslint-disable-next-line no-console
import express from 'express';
import DBConnexion from './src/middlewares/dbConnexion';
import defaultRouter from './src/routes/default.route';
import authRouter from './src/routes/authentification.route';

class Server {
  constructor(port) {
    this.app = express();
    this.app.listen(port, () => {
      this.initDB();
      this.initRoutes();
    });
  }

  initDB() {
    this.db = new DBConnexion();
    this.db.test();
  }

  initRoutes() {
    this.app.use(defaultRouter);
    this.app.use(authRouter);
  }
}

const server = new Server(3000);
