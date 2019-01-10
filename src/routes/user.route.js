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
  const { WT, email } = req.query;

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
router.route('/updatePicture').post((req, res) => {

});

/**
 * update preferences
 */
router.route('/updatePreferences').post((req, res) => {

});

export default router;
