import { Router } from 'express';
import xss from 'xss';
import dbService from '../services/db.service';
import webtoken from '../middlewares/webtoken';


const router = Router();

// Middleware qui protège les requêtes
router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !webtoken.verifyToken(auth.split(' ')[1])) {
    return res.status(401).send({ err: 'User not authentified' });
  }

  const { idUser } = req.query.idUser ? req.query : req.body;

  const decodeToken = webtoken.decode(auth.split(' ')[1]);

  if (!decodeToken) { return res.status(500).send({ err: 'Impossible to decode token' }); }

  // Vérification XSS
  const queryValues = Object.values(req.query);
  const verificationXSS = queryValues.map(value => xss(value));
  if (JSON.stringify(verificationXSS) !== JSON.stringify(queryValues)) {
    return res.status(401).send({ err: 'XSS detected' });
  }

  // On remplace toutes les caractères qui posent problème pour les requêtes
  // Pas d'influence sur ce qui est stocké en db
  const changeCaract = (query) => {
    Object.keys(query).forEach((key) => {
      if (typeof query[key] === 'string') {
        query[key] = query[key].replace('\'', '\'\''); // eslint-disable-line no-param-reassign
      }
    });
    return query;
  };
  req.query = changeCaract(req.query);
  req.body = changeCaract(req.body);

  if (decodeToken.payload.idUser !== idUser) {
    return res.status(401).send({ err: 'IdUser and webtoken don\'t match' });
  }

  return next();
});

/**
 * get user profile with
 *  - picture
 *  - preferences
 *  - age
 *  - name
 */
router.route('/userProfile').get(async (req, res) => {
  const { idUser } = req.query;

  // Check parameters
  if (!idUser || typeof idUser !== typeof 'string') { return res.status(400).send('Bad parameters'); }
  let profile;
  try {
    profile = await dbService.profileUser(idUser);
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when getProfile' });
  }
  if (profile && profile[0].length !== 0) {
    return res.status(200).send({ profile: profile[0] });
  }
  return res.status(404).send({ err: 'Profile not found' });
});

/**
 * Update tout le profil d'un utilisateur
 */
router.route('/updateProfile').post(async (req, res) => {
  const {
    idUser, tagsArray, description, linkPicture, firstname, lastname,
  } = req.body;
  // Check parameters
  if (!idUser || !tagsArray || !description || !linkPicture
    || !firstname || !lastname) { return res.status(400).send('Missing Parameters'); }

  // Check types
  if (typeof idUser !== 'string' || !Array.isArray(tagsArray)
    || typeof description !== 'string' || typeof linkPicture !== 'string'
    || typeof firstname !== 'string' || typeof lastname !== 'string') {
    return res.status(400).send('Bad parameters');
  }

  try {
    await dbService.updateProfile(idUser, linkPicture, description, tagsArray, firstname, lastname);
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error when updating the profile of the user' });
  }
  return res.status(200).send({ message: 'Profile updated!' });
});

export default router;
