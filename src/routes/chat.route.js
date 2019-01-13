import { Router } from 'express';
import dbService from '../services/db.service';

const router = Router();
/**
 * Route pour avoir tous les messages d'un utilisateur
 */
router.route('/allMessages').get(async (req, res) => {
  const { idUser } = req.query;

  // On vérifie les types et existences
  if (!idUser || typeof idUser !== typeof 'string') { return res.status(400).send({ error: 'Bad parameters' }); }

  try {
    const result = await dbService.getMessages(idUser);
    if (result[0].length !== 0) { return res.status(200).send({ messages: result[0] }); }
    return res.status(200).send({ messages: null });
  } catch (e) {
    return res.status(500).send({ err: 'Error append during retreving all messages' });
  }
});

export default router;
