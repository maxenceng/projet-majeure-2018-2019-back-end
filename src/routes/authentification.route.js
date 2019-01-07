import { Router } from 'express';
import authController from '../controllers/authentification.controller';
import webtoken from '../middlewares/webtoken';
import bodyparser from '../utils/bodyparser';

const router = Router();
// TODO Transmettre la DB au controller
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
router.route('/signUp').post((req, res) => {
  function callback(body) {
    const password = body.password;
    const passwordVerif = body.passwordVerif;
    const email = body.email;
    const firstname = body.firstname;
    const name = body.name;

    // Missing parameters check
    if (!firstname || !name || !password || !email || !passwordVerif) { res.status(400).send('missing parameters'); }

    // On vérifie le type des arguments
    if (typeof firstname === 'string' && typeof name === 'string' && typeof password === 'string'
      && typeof email === 'string' && typeof passwordVerif === 'string') {
      // Check email
      if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        .test(email)) { res.status(404).send('Enter a valid email'); }

      // Check passwords
      if (passwordVerif !== password) { res.status(400).send('Passwords don\'t match'); }

      // SignUp
      res.status(400).send('OK !!!');
      // authController.signUp(firstname, name, password, email, res);
    } else {
      res.status(400).send('bad parameters');
    }
  }
  bodyparser(req, callback);
});

// Route test, à supprimmer
router.route('/deliverToken').get((req, res) => {
  const payload = {
    admin: false,
  };
  res.send(webtoken.signToken(payload));
});

// Route test, à supprimmer
router.route('/decodeToken').get((req, res) => {
  res.send(webtoken.decode(req.query.WT));
});

export default router;
