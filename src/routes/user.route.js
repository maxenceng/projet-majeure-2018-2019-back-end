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
    res.status(500).send({ err: 'Error append when getProfile' });
  }
  if (profile[0].length !== 0) {
    return res.status(200).send({ profile: profile[0] });
  }
  return res.status(404).send({ err: 'Profile not found ' });
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

/**
 * update preferences
 */
router.route('/updateDescription').post(async (req, res) => {
  const { email, description } = req.body;

  // Check parameters
  if (!email || !description) { return res.status(400).send('Missing Parameters'); }

  // Check types
  if (typeof email !== 'string' || typeof description !== 'string') { return res.status(400).send('Bad parameters'); }

  const { err, message } = await dbService.updateDescription(email, description);

  if (err) { return res.status(400).send({ err }); }
  return res.status(200).send({ message });
});

/**
 * update preferences
 */
router.route('/updateProfilePicture').post(async (req, res) => {
  const { email, linkPicture } = req.body;

  // Check parameters
  if (!email || !linkPicture) { return res.status(400).send('Missing Parameters'); }

  // Check types
  if (typeof email !== 'string' || typeof linkPicture !== 'string') { return res.status(400).send('Bad parameters'); }

  const { err, message } = await dbService.updateProfilePicture(email, linkPicture);

  if (err) { return res.status(400).send({ err }); }
  return res.status(200).send({ message });
});

export default router;
