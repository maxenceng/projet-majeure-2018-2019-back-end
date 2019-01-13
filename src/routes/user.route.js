import { Router } from 'express';
import dbService from '../services/db.service';
import webtoken from '../middlewares/webtoken';

const router = Router();

// Middleware qui check le webtoken
router.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && webtoken.verifyToken(auth.split(' ')[1])) {
    return next();
  }
  return res.status(401).send('User not authentified');
});

/**
 * get user profile with
 *  - picture
 *  - preferences
 *  - age
 *  - name
 */
router.route('/userProfile').get(async (req, res) => {
  const { email } = req.query;

  // Check parameters
  if (!email || typeof email !== typeof 'string') { return res.status(400).send('Bad parameters'); }
  let profile;
  try {
    profile = await dbService.profileUser(email);
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when getProfile' });
  }
  console.log(profile);
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
    email, tags, description, linkPicture,
  } = req.body;

  // Check parameters
  if (!email || !tags || !description || !linkPicture) { return res.status(400).send('Missing Parameters'); }

  // Check types
  if (typeof email !== 'string' || !Array.isArray(tags)
    || typeof description !== 'string' || typeof linkPicture !== 'string') {
    return res.status(400).send('Bad parameters');
  }

  try {
    await dbService.updateProfile(email, linkPicture, description, tags);
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error when updating the profile of the user' });
  }
  return res.status(200).send({ message: 'Profile updated!' });
});

export default router;
