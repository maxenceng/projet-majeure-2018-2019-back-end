import { Router } from 'express';
import authController from '../controllers/authentification.controller';
import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';

const router = Router();
/**
 * Route Signin pour le site, vérifie tous les paramètres sont présents
 */
router.route('/signIn').post(async (req, res) => {
  const { email, password } = req.body;

  // Check missing parameters
  if (!email || !password) { return res.status(404).send({ err: 'Missing parameters' }); }

  // Check types email and password
  if (typeof email === 'string' && typeof password === 'string') {
    // Check valid email
    if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      .test(email)) { return res.status(404).send({ err: 'Enter a valid email' }); }

    // Check password length
    if (password.length > 50) { return res.status(404).send({ err: 'Password too long!' }); }

    // SignIn
    try {
      return await authController.signIn(email, password, res);
    } catch (e) {
      console.error(e);
      return res.status(500).send({ err: 'Error append during SignIn' });
    }
  }
  return res.status(400).send({ err: 'bad parameters' });
});

/**
 * Route Signup pour le site, vérifie tous les paramètres sont présents
 * et que les passwords match bien
 */
router.route('/signUp').post(async (req, res) => {
  const {
    name, firstname, email, password, passwordVerif,
  } = req.body;

  // Missing parameters check
  if (!firstname || !name || !password || !email || !passwordVerif) { return res.status(400).send({ err: 'missing parameters' }); }

  // On vérifie le type des arguments
  if (typeof firstname === 'string' && typeof name === 'string' && typeof password === 'string'
    && typeof email === 'string' && typeof passwordVerif === 'string') {
    // Check email
    if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      .test(email)) { return res.status(400).send({ err: 'Enter a valid email' }); }

    // Check longueur noms
    if (firstname.length > 60 || name.length > 60 || password.length > 40) { return res.status(400).send({ err: 'Too long firstname or name or password!' }); }

    // Check passwords
    if (passwordVerif !== password) { return res.status(400).send({ err: 'Passwords don\'t match' }); }

    // SignUp
    try {
      return await authController.signUp(firstname, name, password, email, res);
    } catch (e) {
      console.error(e);
      return res.status(500).send({ err: 'Error append during signUp' });
    }
  }
  return true;
});

router.route('/connexionOpenId').post(async (req, res) => {
  const {
    name, firstname, email, password, passwordVerif,
  } = req.body;

  // Missing parameters check
  if (!firstname || !name || !password || !email || !passwordVerif) { return res.status(400).send({ err: 'missing parameters' }); }

  // On vérifie le type des arguments
  if (typeof firstname === 'string' && typeof name === 'string' && typeof password === 'string'
    && typeof email === 'string' && typeof passwordVerif === 'string') {
    // Check email
    if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      .test(email)) { return res.status(400).send({ err: 'Enter a valid email' }); }

    // Check longueur noms
    if (firstname.length > 60 || name.length > 60 || password.length > 40) { return res.status(400).send({ err: 'Too long firstname or name or password!' }); }

    // Check passwords
    if (passwordVerif !== password) { return res.status(400).send({ err: 'Passwords don\'t match' }); }

    // SignIn openId
    let result;
    try {
      result = await dbService.getUser(email, password);
    } catch (e) { throw e; }

    if (result[0].length !== 0) {
      const user = result[0][0];
      const idUser = user.ID_USER;
      let admin = false;
      if (user.admin) { admin = true; }
      const payload = {
        admin,
        idUser,
      };
      const WT = webtoken.signToken(payload);
      return res.status(200).send({ message: 'signIn with openId sucess', token: WT, user });
    }

    // SignUp openId
    try {
      return await authController.signUp(firstname, name, password, email, res);
    } catch (e) {
      console.error(e);
      return res.status(500).send({ err: 'Error append during signup with connexionOpenId' });
    }
  }
  return true;
});

export default router;
