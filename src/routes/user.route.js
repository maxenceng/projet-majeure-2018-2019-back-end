import { Router } from 'express';

const router = Router();

/**
 * get user profile with
 *  - picture
 *  - preferences
 *  - age
 *  -
 */
router.route('/userProfile').get((req, res) => {

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

/**
 * get all messages with other users
 */
router.route('/userMessages').get((req, res) => {

});

export default router;
