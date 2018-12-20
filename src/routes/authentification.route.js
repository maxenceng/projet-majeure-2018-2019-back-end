import { Router } from 'express';
import authController from '../controllers/authentification';

const router = Router();

/**
 * Route Signin pour le site, vérifie tous les paramètres sont présents
 */
router.route('/signIn').get((req, res) => {
  const password = req.params.password;
  const email = req.params.email;
  const username = req.params.username;
  if (typeof username === 'string' && typeof password === 'string') {
    authController.signInWithUsername(username, password, res);
  } else if (typeof email === 'string' && typeof password === 'string') {
    authController.signInWithEmail(username, password, res);
  } else {
    res.status(400).send('bad parameters');
  }
});

/**
 * Route Signup pour le site, vérifie tous les paramètres sont présents
 * et que les passwords match bien
 */
router.route('/signUp').get((req, res) => {
  authController.signUp(req, res);
  const password = req.params.password;
  const passwordVerif = req.params.passwordVerif;
  const email = req.params.email;
  const username = req.params.username;
  if (typeof username === 'string' && typeof password === 'string' && typeof email === 'string' && typeof passwordVerif === 'string') {
    if (passwordVerif === password) {
      authController.signUp(username, password, email, res);
    } else {
      res.status(400).send('Passwords don\'t match');
    }
  } else {
    res.status(400).send('bad parameters');
  }
});

export default router;
