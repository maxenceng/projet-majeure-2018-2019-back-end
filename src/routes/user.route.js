import { Router } from 'express';
import dbService from '../services/db.service';

const router = Router();

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

/**
 * update the picture of the user
 */
router.route('/updateTags').post((req, res) => {
  const { email, tags } = req.body;

  // Check parameters
  if (!email || !tags) { return res.status(400).send('Missing Parameters'); }

  // Check types
  if (typeof email !== 'string' || !Array.isArray(tags)) { return res.status(400).send('Bad parameters'); }

  const cb = (err, updateProfile) => {
    if (err) { return res.status(400).send({ error: err }); }
    return res.status(200).send({ message: updateProfile });
  };
  return dbService.updateTags(email, tags, cb);
});

export default router;
