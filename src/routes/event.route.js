import { Router } from 'express';
import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';
import opencage from '../services/opencage.service';

const router = Router();

/**
 * Route pour obetnir des évenements
 *  - location OBLIGATOIRE
 *  - tags NON OBLIGATOIRE
 *  - date NON OBLIGATOIRE
 */
router.route('/allEvents').get(async (req, res) => {
  const {
    date, location, tags,
  } = req.query;

  let tabTags;
  let locationObj;
  const formattedDate = parseInt(date, 10);

  try {
    locationObj = JSON.parse(location);
    // Check parameter location
    if (!locationObj || typeof locationObj !== typeof JSON.parse('{"test": "test"}')) {
      return res.status(400).send({ err: 'Location is missing' });
    }

    // Check location type
    if (!locationObj.lng || !locationObj.lat
      || typeof locationObj.lng !== typeof 2 || typeof locationObj.lat !== typeof 2) {
      return res.status(400).send({ err: 'Lat or lng is not defined' });
    }
  } catch (e) {
    console.error(e);
  }

  if (!locationObj) {
    try {
      const result = await opencage.findCoord(location);
      locationObj = {
        lat: result.results[0].geometry.lat,
        lng: result.results[0].geometry.lng,
      };
    } catch (e) {
      console.error(e);
      return res.status(404).send({ err: 'City not found' });
    }
  }

  // Check date type
  if (date && typeof formattedDate !== typeof 2) { return res.status(400).send({ err: 'Wrong date type' }); }

  // Check tags
  if (tags && typeof tags !== typeof 'string') {
    return res.status(400).send({ err: 'Wrong tags type' });
  }

  // On transforme la chaine de caractère tags en string
  if (tags) {
    tabTags = tags.split(',');
    tabTags = tabTags.map(tag => tag.trim());
  }

  try {
    const result = await dbService.allEvents(formattedDate, locationObj, tabTags);
    if (result[0]) {
      return res.status(200).send({ message: 'Get events ok!', events: result[0] });
    }
    return res.status(200).send({ message: 'Get events ok!', events: [] });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ err: 'Error append when getting events' });
  }
});

/**
 * get a random event for the user
 */
router.route('/randomEvent').get((req, res) => {

});

/**
 * events chosed for the user in particular
 */
router.route('/relatedProfileEvents').get((req, res) => {

});

/**
 * route to add a new event, admin reserved
 *  - event name REQUIRED
 *  - event desc REQUIRED
 *  - media : type et content REQUIRED
 *  - location: lng et lat REQUIRED
 *  - tags REQUIRED
 *  - date REQUIRED
 */
router.route('/addEvent').post(async (req, res) => {
  // Check if admin with token
  const token = req.headers.authorization.split(' ')[1];
  const decodeWT = webtoken.decode(token);
  if (decodeWT && decodeWT.payload.admin) {
    const {
      date, location, tags, eventName, eventDesc, media,
    } = req.body;

    // Check event name
    if (!eventName || typeof eventName !== 'string') { return res.status(400).send({ err: 'Name of event is not defined' }); }

    // Check event description
    if (!eventDesc || typeof eventDesc !== 'string') { return res.status(400).send({ err: 'Description of event is not defined' }); }

    // Check parameter location
    if (!location || typeof location !== typeof JSON.parse('{"test": "test"}')) { return res.status(400).send({ err: 'Location is missing' }); }

    // Check parameter media
    if (!media || typeof media !== typeof JSON.parse('{"test": "test"}')) { return res.status(400).send({ err: 'Media is missing' }); }

    // Check location type
    if (!location.lng || !location.lat
      || typeof location.lng !== typeof 2 || typeof location.lat !== typeof 2) {
      return res.status(400).send({ err: 'Lat or lng is not defined' });
    }

    // Check media type
    if (!media.type || !media.content
      || typeof media.type !== typeof 'string' || typeof media.content !== typeof 'string') {
      return res.status(400).send({ err: 'type or content is not defined' });
    }

    // Check date type
    if (date && typeof date !== typeof 2) { return res.status(400).send({ err: 'Wrong date type' }); }

    // Check preferences
    if (tags && !Array.isArray(tags)) {
      return res.status(400).send({ err: 'Wrong preferences type' });
    }

    // On essaye de trouver la ville associée
    let city;
    try {
      city = await opencage.findCity(location.lat, location.lng);
    } catch (e) {
      city = null;
    }

    try {
      await dbService.addEvent(date, location, city, tags, media, eventName, eventDesc);
      return res.status(200).send({ message: 'Event well added!' });
    } catch (e) {
      console.error(e);
      return res.status(500).send({ err: 'Error append when adding event' });
    }
  } else {
    return res.status(400).send({ err: 'Not authorized!!' });
  }
});

export default router;
