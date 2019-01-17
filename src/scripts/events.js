import dbService from '../services/db.service';
import ticketmaster from '../services/ticketmaster.service';
import opencage from '../services/opencage.service';

const city = 'San Francisco';

opencage.findCoord(city).then((coords) => {
  const locationObj = {
    lat: coords.results[0].geometry.lat,
    lng: coords.results[0].geometry.lng,
  };
  ticketmaster(city, 100)
    .then(async (res) => {
      try {
        await Promise.all(res._embedded.events.map((event) => {
          const media = {
            type: 'image',
            content: event.images[0].url,
          };
          const description = event.promoter ? event.promoter.description : 'No description available';
          try {
            return dbService.addEvent(Date.now(event.dates.start.dateTime), locationObj, city,
              [event.classifications[0].segment.name], media,
              event.name, description);
          } catch (e) {
            console.error(e);
            throw e;
          }
        }));
      } catch (e) {
        console.error(e);
        throw e;
      }
    })
    .catch((err) => { console.log(err); throw err; });
}).catch((err) => { console.log(err); throw err; });
