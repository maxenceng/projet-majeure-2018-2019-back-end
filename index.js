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
import participationRouter from './src/routes/participation.route';
import openid from './src/services/openID.service';


// TODO
const corsOptions = {
  origin: 'http://example.com',
};

class Server {
  constructor(port) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.initRoutesREST();
    const server = this.app.listen(port);
    // Attach Socket IO to the server
    this.io = io(server);
    this.chatAsync = new ChatAsync(this.io);
  }

  initRoutesREST() {
    this.app.use(defaultRouter);
    this.app.use(authRouter);

    // Protected routes
    this.app.use(userRouter);
    this.app.use(chatRouter);
    this.app.use(eventRouter);
    this.app.use(participationRouter);
  }
}

const server = new Server(3001);
