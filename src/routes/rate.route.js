import { Router } from 'express';
import webtoken from '../middlewares/webtoken';

const router = Router();

/**
 * rate a past event, from 1 to 5 stars!
 */
router.route('/rateEvent').post((req, res) => {
  // Put some stars
});

// Middleware qui check le webtoken
router.use((req, res, next) => {
  if (!webtoken.verifyToken(req.header.WT)) { return res.status(401).send('User not auhtentified'); }
  return next();
});

export default router;
