import dbService from '../services/db.service';

const location = { lng: 4.869803, lat: 45.784816 };
const tags = ['test', 'basic'];
const media = { type: 'test', content: 'content' };
const eventName = 'eventd';
const desc = 'desac';
const date = Date.now() + 1000 * 3600 * 24 * 7;

dbService.getUser('', '')
  .then(() => dbService.createMessage(
    'test',
    'd874c439-5216-4c1e-87c4-a9ec74c66d9f',
    '324486b1-ed95-43ab-9117-b7b7b9641dc8',
  )
    .then(result => console.log(result))
    .catch(err => console.log(err)))
  .catch(err => console.log(err));
