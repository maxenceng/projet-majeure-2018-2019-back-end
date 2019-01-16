import rp from 'request-promise';

export default {
  findCity: async (lat, lng) => {
    try {
      const result = await rp(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=49f817fd8f3e49419ae554acd3d722e1`);
      const resultJson = JSON.parse(result);
      return resultJson.results[0].formatted;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  findCoord: async (city) => {
    try {
      const result = await rp(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=49f817fd8f3e49419ae554acd3d722e1`);
      const resultJson = JSON.parse(result);
      return resultJson;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};
