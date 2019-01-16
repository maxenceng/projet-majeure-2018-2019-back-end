import { Router } from 'express';

const router = Router();

/**
 * rate a past event, from 1 to 5 stars!
 */
router.route('/rateEvent').post((req, res) => {
  // Put some stars
});

export default router;
