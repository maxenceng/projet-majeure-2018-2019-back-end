import { Router } from 'express';
import dbService from '../services/db.service';
import bodypaser from '../utils/bodyparser';

const router = Router();

/**
 * get user profile with
 *  - picture
 *  - preferences
 *  - age
 *  - name
 */
router.route('/userProfile').get((req, res) => {
  const { email } = req.query;

  // Check parameters
  if (!email || typeof email !== typeof 'string') { return res.status(400).send('Bad parameters'); }

  const cb = (err, profile) => {
    if (err) { return res.status(400).send({ error: err }); }
    return res.status(200).send({ message: profile });
  };
  return dbService.profileUser(email, cb);
});

/**
 * update the picture of the user
 */
router.route('/updateTags').post((req, res) => {
  const callback = (body) => {
    const { email, tags } = body;

    // Check parameters
    if (!email || !tags) { return res.status(400).send('Missing Parameters'); }

    // Check types
    if (typeof email !== 'string' || !Array.isArray(tags)) { return res.status(400).send('Bad parameters'); }

    const cb = (err, updateProfile) => {
      if (err) { return res.status(400).send({ error: err }); }
      return res.status(200).send({ message: updateProfile });
    };
    return dbService.updateTags(email, tags, cb);
  };
  bodypaser(req, callback);
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
