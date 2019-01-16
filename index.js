// eslint-disable-next-line no-console
import express from 'express';
import http from 'http';
import io from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import defaultRouter from './src/routes/default.route';
import authRouter from './src/routes/authentification.route';
import chatRouter from './src/routes/chat.route';
import userRouter from './src/routes/user.route';
import eventRouter from './src/routes/event.route';
import ChatAsync from './src/routes/chatasync.route';
import openid from './src/services/openID.service';


// TODO
const corsOptions = {
  origin: 'http://example.com',
};

class Server {
  constructor(port) {
    this.app = express();
    const server = http.createServer(this.app);
    this.io = io(server);
    this.app.listen(port, () => {
      this.app.use(bodyParser.json());
      this.app.use(cors());
      this.initRoutesREST();
      this.chatAsync = new ChatAsync(this.io);
    });
  }

  initRoutesREST() {
    this.app.use(defaultRouter);
    this.app.use(authRouter);

    // Protected routes
    this.app.use(userRouter);
    this.app.use(chatRouter);
    this.app.use(eventRouter);
  }
}

const server = new Server(3001);
