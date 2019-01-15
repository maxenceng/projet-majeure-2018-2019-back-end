import dbService from '../services/db.service';

const location = { lng: 4.869803, lat: 45.784816 };
const tags = ['test', 'basic'];
const media = { type: 'test', content: 'content' };
const eventName = 'eventd';
const desc = 'desac';
const date = Date.now() + 1000 * 3600 * 24 * 7;

dbService.getUser('', '')
  .then(() => dbService.addEvent(date, location, tags, media, eventName, desc)
    .then(result => console.log(result))
    .catch(err => console.log(err)))
  .catch(err => console.log(err));
