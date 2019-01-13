import { Router } from 'express';
import dbService from '../services/db.service';
import webtoken from '../middlewares/webtoken';

const router = Router();
/**
 * Route pour avoir tous les messages d'un utilisateur
 */
router.route('/allMessages').get(async (req, res) => {
  const { email } = req.query;

  // On vérifie le token TODO Décocher en prod
  // if (!webtoken.verifyToken(WT))
  // { return res.status(401).send({ error: 'User not authenticated' }); }

  // On vérifie les types et existences
  if (!email || typeof email !== typeof 'string') { return res.status(400).send({ error: 'Bad parameters' }); }

  try {
    const result = await dbService.getMessages(email);
    if (result[0].length !== 0) { return res.status(200).send({ messages: result[0] }); }
    return res.status(200).send({ messages: null });
  } catch (e) {
    return res.status(500).send({ err: 'Error append during retreving all messages' });
  }
});

// Middleware qui check le webtoken
router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && webtoken.verifyToken(auth.split(' ')[1])) {
    return next();
  }
  return res.status(401).send('User not authentified');
});

export default router;
