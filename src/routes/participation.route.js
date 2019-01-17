import { Router } from 'express';
import dbService from '../services/db.service';

const router = Router();

/**
 * Verification, if a user has an event in favorite
 */
router.route('/userFavoriteEvent').get(async (req, res) => {
  const { idUser, idEvent } = req.query;

  // Check idUser
  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  // Check idEvent
  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    const favorite = await dbService.userFavoriteEvent(idUser, idEvent);
    return res.status(200).send({ favorite });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when looking for the favorite' });
  }
});

/**
 * Verification, if a user participate at an event or not
 */
router.route('/userParticipateEvent').get(async (req, res) => {
  const { idUser, idEvent } = req.query;

  // Check idUser
  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  // Check idEvent
  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    const participation = await dbService.userParticipateEvent(idUser, idEvent);
    return res.status(200).send({ participation });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when looking for the participation' });
  }
});

/**
 * Find all users that may be interested to participate to the event
 */
router.route('/usersInterestedEvent').get(async (req, res) => {
  const { idEvent } = req.query;

  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    const event = await dbService.userInterrestedEvent(idEvent);
    return res.status(200).send({ event });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when search interested users for the event' });
  }
});

/**
 * Find all users have the event in favorite
 */
router.route('/eventFavorites').get(async (req, res) => {
  const { idEvent } = req.query;

  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    const event = await dbService.eventFavorites(idEvent);
    return res.status(200).send({ event });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when get the user that have the event in favorite' });
  }
});

/**
 * Find all users that participate to the event and send some informations about the event
 */
router.route('/event').get(async (req, res) => {
  const { idEvent } = req.query;

  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    const event = await dbService.eventParticipate(idEvent);
    return res.status(200).send({ event });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when check for participants of the event' });
  }
});

/**
 * Get the different events where the user is participating
 */
router.route('/userEvents').get(async (req, res) => {
  const { idUser } = req.query;

  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  try {
    const events = await dbService.userEvents(idUser);
    return res.status(200).send({ events });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when getting events for the user' });
  }
});

/**
 * route called when the user remove his particiapation for the event
 */
router.route('/removeParticipation').get(async (req, res) => {
  const { idUser, idEvent } = req.query;

  // Check idUser
  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  // Check idEvent
  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    await dbService.removeParticipation(idUser, idEvent);
    return res.status(200).send({ message: 'Participation cancelled' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Problem when removing participation to an event' });
  }
});

/**
 * route called when a user says he wants to participate to an event
 */
router.route('/participateEvent').get(async (req, res) => {
  const { idUser, idEvent } = req.query;

  // Check idUser
  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  // Check idEvent
  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    await dbService.participateEvent(idUser, idEvent);
    return res.status(200).send({ message: 'Participation for the event accepted' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Problem when participate for the event' });
  }
});

/**
 * route called when a user says he put an event in favorite
 */
router.route('/favoriteUserEvent').get(async (req, res) => {
  const { idUser, idEvent } = req.query;

  // Check idUser
  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  // Check idEvent
  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    await dbService.favoriteEvent(idUser, idEvent);
    return res.status(200).send({ message: 'Favorite accepted' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Problem when favorite an event' });
  }
});

/**
 * route called when the user remove his favorite for the event
 */
router.route('/removeFavorite').get(async (req, res) => {
  const { idUser, idEvent } = req.query;

  // Check idUser
  if (!idUser || typeof idUser !== 'string') { return res.status(400).send({ err: 'idUser is not defined' }); }

  // Check idEvent
  if (!idEvent || typeof idEvent !== 'string') { return res.status(400).send({ err: 'idEvent is not defined' }); }

  try {
    await dbService.removeFavorite(idUser, idEvent, false);
    return res.status(200).send({ message: 'Favorite on event cancelled' });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Problem when removing favorite to an event' });
  }
});

export default router;
