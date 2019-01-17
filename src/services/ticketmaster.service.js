import request from 'request-promise';

export default async (city, size) => {
  const params = {
    apiKey: 'REP9Ir8TT7riLMhAMvTJpIvrVdbEd9fm',
    size,
    city,
    startDateTime: '2019-02-01T02:00:00Z',
  };

  const uri = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${params.apiKey}
    &city=${params.city}&size=${params.size}&startDateTime=${params.startDateTime}`;

  try {
    const res = await request.get(uri);
    return JSON.parse(res);
  } catch (e) {
    return console.error(e);
  }
};
