import { Router } from 'express';
import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';

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

  // Verify token
  // if (!webtoken.verifyToken(WT)) { return res.status(401).send('User not auhtentified'); }

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
  const { email, tags } = req.query;

  // Check parameters
  if (!email || !tags || typeof email !== typeof 'string') { return res.status(400).send('Bad parameters'); }

  // TODO vérifier tags

  const cb = (err, updateProfile) => {
    if (err) { return res.status(400).send({ error: err }); }
    return res.status(200).send({ message: updateProfile });
  };
  return dbService.updateTags(email, tags, cb);
});

/**
 * update preferences
 */
router.route('/updatePreferences').post((req, res) => {

});

// Middleware qui check le webtoken
router.use((req, res, next) => {
  if (!webtoken.verifyToken(req.header.WT)) { return res.status(401).send('User not auhtentified'); }
  return next();
});

export default router;
