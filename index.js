// eslint-disable-next-line no-console
import express from 'express';
import DBConnexion from './src/middlewares/dbConnexion';
import defaultRouter from './src/routes/default.route';

const app = express();

const db = new DBConnexion();
db.test();
app.use(defaultRouter);
app.listen(3000);
