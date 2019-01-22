import { Router } from 'express';
import dbService from '../services/db.service';

const router = Router();
/**
 * Route pour avoir tous les messages d'une conversation
 */
router.route('/conv').get(async (req, res) => {
  const { idUser, idSecondUser } = req.query;

  // On vérifie les types et existences
  if (!idUser || typeof idUser !== typeof 'string') { return res.status(400).send({ err: 'Bad parameters' }); }

  if (!idSecondUser || typeof idSecondUser !== typeof 'string') { return res.status(400).send({ err: 'Bad parameters' }); }

  try {
    const result = await dbService.getMessages(idUser, idSecondUser);
    if (result[0].length !== 0) { return res.status(200).send({ messages: result[0] }); }
    return res.status(200).send({ messages: null });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append during retreving all messages' });
  }
});

/**
 * Route pour avoir toutes les conversations d'un utilisateur
 */
router.route('/userConv').get(async (req, res) => {
  const { idUser } = req.query;

  // On vérifie les types et existences
  if (!idUser || typeof idUser !== typeof 'string') { return res.status(400).send({ err: 'Bad parameters' }); }

  try {
    const result = await dbService.userConv(idUser);
    if (result) { return res.status(200).send({ conversations: result }); }
    return res.status(200).send({ conversations: null });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ err: 'Error append during retreving all conversations' });
  }
});

/**
 * Route permettant d'envoyer un message à un utilisateur (route test)
 */
router.route('/sendMessage').post(async (req, res) => {
  const { idExp, idDest, message } = req.body;

  try {
    await dbService.createMessage(message, idExp, idDest);
    return res.status(200).send({ messages: 'Message well registered!' });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ err: 'Error append during retreving all messages' });
  }
});

export default router;
