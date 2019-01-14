import { Router } from 'express';
import dbService from '../services/db.service';
import webtoken from '../middlewares/webtoken';

const router = Router();

// Middleware qui check le webtoken
/* router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && webtoken.verifyToken(auth.split(' ')[1])) {
    return next();
  }
  return res.status(401).send('User not authentified');
}); */

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
    idUser, tags, description, linkPicture, firstname, lastname,
  } = req.body;

  // Check parameters
  if (!idUser || !tags || !description || !linkPicture
      || !firstname || !lastname) { return res.status(400).send('Missing Parameters'); }

  // Check types
  if (typeof idUser !== 'string' || !Array.isArray(tags)
    || typeof description !== 'string' || typeof linkPicture !== 'string'
    || typeof firstname !== 'string' || typeof lastname !== 'string') {
    return res.status(400).send('Bad parameters');
  }

  try {
    await dbService.updateProfile(idUser, linkPicture, description, tags, firstname, lastname);
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error when updating the profile of the user' });
  }
  return res.status(200).send({ message: 'Profile updated!' });
});

export default router;
