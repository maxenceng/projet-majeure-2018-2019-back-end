import { Router } from 'express';
import webtoken from '../middlewares/webtoken';

const router = Router();

/**
 * get a random event for the user
 */
router.route('/randomEvent').get((req, res) => {

});

/**
 * route called when the user remove his particiapation for the event
 */
router.route('/removeParticipation').post((req, res) => {

});

/**
 * route called when a user says he wants to participate to an event
 */
router.route('/participateEvent').post((req, res) => {

});

/**
 * get all events
 * they can be different with the parameters sent
 *  - date
 *  - location
 *  - topics
 */
router.route('/allEvents').get((req, res) => {

});

/**
 * events chosed for the user in particular
 */
router.route('/relatedProfileEvents').get((req, res) => {
  if (webtoken.verifyToken(req.params.WT)) {
    res.status(200).send('Authorized!!');
  }
});

/**
 * route to add a new event, admin reserved
 */
router.route('/addEvent').get((req, res) => {
  // Check if admin with token
  const { WT } = req.query;
  if (webtoken.verifyToken(WT)) {
    const decodeWT = webtoken.decode(WT);
    if (decodeWT && decodeWT.paylaod.admin) {
      res.status(200).send('Authorized!!');
    }
  }
});

export default router;
