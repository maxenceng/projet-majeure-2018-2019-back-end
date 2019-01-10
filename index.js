// eslint-disable-next-line no-console
import express from 'express';
import http from 'http';
import io from 'socket.io';
import defaultRouter from './src/routes/default.route';
import authRouter from './src/routes/authentification.route';
import chatRouter from './src/routes/chat.route';
import userRouter from './src/routes/user.route';

// TODO
// process.env.CONFIG = JSON.stringify(CONFIG);

class Server {
  constructor(port) {
    this.app = express();
    const server = http.createServer(this.app);
    this.io = io(server);
    this.app.listen(port, () => {
      this.initRoutesREST();
    });
  }

  initRoutesREST() {
    this.app.use(defaultRouter);
    this.app.use(authRouter);
    this.app.use(chatRouter);
    this.app.use(userRouter);
  }
}

const server = new Server(3000);
