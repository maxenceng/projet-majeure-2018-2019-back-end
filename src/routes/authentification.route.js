import { Router } from 'express';
import authController from '../controllers/authentification.controller';
import webtoken from '../middlewares/webtoken';
import bodyparser from '../utils/bodyparser';

const router = Router();
// TODO Transmettre la DB au controller
/**
 * Route Signin pour le site, vérifie tous les paramètres sont présents
 */
router.route('/signIn').post((req, res) => {
  const { email, password } = req.body;

  // Check missing parameters
  if (!email || !password) { return res.status(404).send({ message: 'Missing parameters' }); }

  // Check types email and password
  if (typeof email === 'string' && typeof password === 'string') {
    // Check valid email
    if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      .test(email)) { return res.status(404).send({ message: 'Enter a valid email' }); }

    // Check password length
    if (password.length > 50) { return res.status(404).send({ message: 'Password too long!' }); }

    // SignIn
    return authController.signIn(email, password, res);
  }
  return res.status(400).send({ error: 'bad parameters' });
});

/**
 * Route Signup pour le site, vérifie tous les paramètres sont présents
 * et que les passwords match bien
 */
router.route('/signUp').post((req, res) => {
  const {
    name, firstname, email, password, passwordVerif,
  } = req.body;

  // Missing parameters check
  if (!firstname || !name || !password || !email || !passwordVerif) { return res.status(400).send({ message: 'missing parameters' }); }

  // On vérifie le type des arguments
  if (typeof firstname === 'string' && typeof name === 'string' && typeof password === 'string'
    && typeof email === 'string' && typeof passwordVerif === 'string') {
    // Check email
    if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      .test(email)) { return res.status(404).send({ message: 'Enter a valid email' }); }

    // Check longueur noms
    if (firstname.length > 60 || name.length > 60 || password.length > 40) { return res.status(400).send({ message: 'Too long firstname or name or password!' }); }

    // Check passwords
    if (passwordVerif !== password) { return res.status(400).send({ message: 'Passwords don\'t match' }); }

    // SignUp
    // res.status(400).send('OK !!!');
    return authController.signUp(firstname, name, password, email, res);
  }
  return res.status(400).send({ error: 'bad parameters' });
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
