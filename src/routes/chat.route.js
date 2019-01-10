import { Router } from 'express';
import chat from '../services/db.service';
import webtoken from '../middlewares/webtoken';

const router = Router();
/**
 * Route pour avoir tous les messages d'un utilisateur
 */
router.route('/allMessages').get((req, res) => {
  const { email, WT } = req.query;

  // On vérifie le token TODO Décocher en prod
  // if (!webtoken.verifyToken(WT))
  // { return res.status(401).send({ error: 'User not authenticated' }); }

  // On vérifie les types et existences
  if (!email || typeof email !== typeof 'string') { return res.status(400).send({ error: 'Bad parameters' }); }

  const cb = (error, messages) => {
    if (error) { return res.status(400).send({ error: 'Error when trying to get all messages' }); }
    return res.status(200).send({ messages });
  };
  return chat.getMessages(email, cb);
});

export default router;
