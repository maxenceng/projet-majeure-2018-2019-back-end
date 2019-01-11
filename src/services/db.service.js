import crypto from 'crypto';
import uuidv4 from 'uuid/v4';
import DBConnexion from '../middlewares/db';

const dbconnexion = new DBConnexion();

/**
 * Service permettant de simuler l'interface avec la base de donnée
 * Pour le moment la base de donnée est directement accessible via node
 * Dans le futur elle pourra être accessible via spring (maybe)
 * Il suffira du modifier ce service pour taper sur les routes
 */
const dbService = {
  getUser(email, password, callback) {
    const hash = crypto.createHash('sha256');
    hash.update(password + email);
    const hashpwd = hash.digest('hex');
    dbconnexion.db.query(`SELECT * FROM "USER" WHERE "USER_PWD" = '${hashpwd}' AND "USER_EMAIL" = '${email}'`).then((result) => {
      callback(null, result[0]);
    }).catch((err) => {
      console.error(err);
      callback('Error append when signIn');
    });
  },

  createUser(firstname, name, email, pwd, callback) {
    // password hashé sale!
    const hash = crypto.createHash('sha256');
    hash.update(pwd + email);
    const hashpwd = hash.digest('hex');
    const uuidTag = uuidv4();
    const uuidProfile = uuidv4();
    // Generate unique interger
    // On check si l'utilisateur existe ou non
    dbconnexion.db.query(`SELECT * FROM "USER" WHERE "USER_EMAIL" = '${email}'`).then((result) => {
      if (result[0].length === 0) {
        // Création du profil associé à l'utilisateur
        dbconnexion.tag.create({
          ID_TAG: uuidTag,
          TAG_TEXT: 'tagtag',
        }).then(() => {
          dbconnexion.profile.create({
            ID_PROFILE: uuidProfile,
            PROFILE_DESC: 'hello',
            PROFILE_AVATAR: 'truc',
            PROFILE_TAG: uuidTag,
          }).catch(err => callback(err));
        }).then(() => {
          // Création de l'utilisateur
          dbconnexion.user.create({
            USER_FIRSTNAME: firstname,
            USER_NAME: name,
            USER_EMAIL: email,
            USER_PWD: hashpwd,
            USER_PROFILE: uuidProfile,
          }).catch(err => callback(err));
        }).then((user) => {
          console.log(user);
          callback();
        })
          .catch((err) => {
            console.error(err);
            callback('Error append creating profile');
          });
      } else {
        callback('User already exist!');
      }
    });
  },

  createMessage(message, author, destEmail, callback) {
    const request = `SELECT c."ID_CONVERSATION" FROM "CONVERSATION" c 
      JOIN "CONV_USER" cu ON cu."ID_CONV" = c."ID_CONVERSATION"
      JOIN "USER" u ON cu."ID_USER" = u."ID_USER"
      WHERE u."USER_EMAIL" = '${destEmail}'`;
    dbconnexion.db.query(request).then((result) => {
      if (result[0].length !== 0) {
        dbconnexion.message.create({
          ID_CONVERSATION: result[0],
          MES_AUTHOR: author,
          // miliseconds depuis le 1 er janvier 1970
          MES_DATA: Date.now(),
          MES_MESSAGE: message,
        });
        return callback(null);
      }
      return callback('No dest found in db');
    }).catch((err) => {
      console.error(err);
      return callback('No dest found in db', null);
    });
  },

  getMessages(email, callback) {
    const request = `SELECT * FROM "MESSAGE" m 
      JOIN "CONVERSATION" c ON m."ID_MESSAGE" = c."CONV_MESSAGE"
      JOIN "CONV_USER" cu ON cu."ID_CONV" = c."ID_CONVERSATION"
      JOIN "USER" u ON cu."ID_USER" = u."ID_USER" 
      WHERE u."USER_EMAIL" = '${email}'`;
    dbconnexion.db.query(request).then((result) => {
      if (result[0].length !== 0) { return callback(null, result[0]); }
      return callback(null, null);
    }).catch((err) => {
      console.error(err);
      callback('Error append when getMessages', null);
    });
  },

  profileUser(email, callback) {
    const request = `SELECT p."PROFILE_DESC", p."PROFILE_AVATAR", p."PROFILE_TAG" 
      FROM "PROFILE" p
      JOIN "USER" u ON p."ID_PROFILE" = u."USER_PROFILE"
      WHERE u."USER_EMAIL" = '${email}'`;
    dbconnexion.db.query(request).then((result) => {
      if (result[0].length !== 0) { return callback(null, result[0]); }
      return callback('No profile found for the user', null);
    }).catch((err) => {
      console.error(err);
      callback('Error append when getProfileUser', null);
    });
  },

  updateTags(email, tags, callback) {
    console.log(tags);
    const request = `
      SELECT p."PROFILE_TAG" FROM "PROFILE" AS p
      JOIN "USER" AS u ON u."USER_PROFILE" = p."ID_PROFILE"
      AND u."USER_EMAIL" = '${email}'`;
    // On cherche l'id du profil corrspondant à l'email
    dbconnexion.db.query(request).then((result) => {
      if (result[0].length !== 0) {
        const profileTag = result[0][0].PROFILE_TAG;
        // On delete tous les anciens tags
        dbconnexion.db.query(`DELETE FROM "TAG" WHERE "ID_TAG" = '${profileTag}'`)
          .then(() => {
            // On recréé tous les nouveaux tags
            tags.forEach((tag) => {
              dbconnexion.tag.create({
                ID_TAG: profileTag,
                TAG_TEXT: tag,
              }).catch((err) => {
                console.error(err);
                return callback(err);
              });
            });
          }).catch((err) => {
            console.error(err);
            return callback(err);
          });
        return callback(null);
      }
      return callback('No tags update');
    }).catch((err) => {
      console.error(err);
      callback('Error when update tags', null);
    });
  },

  async updateDescription(email, description) {
    const request = `
      UPDATE "PROFILE" AS p
      SET "PROFILE_DESC" = '${description}'
      FROM "USER" AS u
      WHERE p."ID_PROFILE" = u."USER_PROFILE"
      AND u."USER_EMAIL" = '${email}'`;
    // On update la description de l'utilisateur
    try {
      await dbconnexion.db.query(request);
      return { err: null, message: 'Description updated!' };
    } catch (e) {
      return ({ err: 'Error during description update', message: '' });
    }
  },

  async updateProfilePicture(email, linkPicture) {
    const request = `
      UPDATE "PROFILE" AS p
      SET "PROFILE_AVATAR" = '${linkPicture}'
      FROM "USER" AS u
      WHERE p."ID_PROFILE" = u."USER_PROFILE"
      AND u."USER_EMAIL" = '${email}'`;
    // On update l'image de profil de l'utilisateur
    try {
      await dbconnexion.db.query(request);
      return { err: null, message: 'link picture profile updated!' };
    } catch (e) {
      return ({ err: 'Error during picture prodile update', message: '' });
    }
  },

  async allEvents(date, location, preferences) {
    const { lng, lat } = location;

    let realDate;
    if (!date || date < Date.now()) { realDate = Date.now(); } else {
      realDate = date;
    }

    let request = `SELECT * FROM "EVENT" e
    JOIN "LOCATION" l WHERE e."EVENT_LOCATION" = l."ID_LOCATION"
    AND l."LOC_LATTITUDE" > ${lat + 1} AND l."LOC_LATTITUDE" < ${lat - 1}
    AND l."LOC_LONGITUDE" > ${lng + 1} AND l."LOC_LONGITUDE" < ${lng - 1}
    AND e."EVENT_DATE" > ${realDate} AND e."EVENT_DATE < ${realDate + 1000 * 3600 * 24 * 2}`;

    const requestPreferences = async preference => `e."EVENT_TAG" = ${preference}`;

    // TODO faire plus plusieurs préférences
    if (preferences) {
      request += 'AND';
      preferences.forEach((pref) => {
        request += `${requestPreferences(pref)}`;
      });
    }

    try {
      const result = await dbconnexion.db.query(request);
      if (result[0]) {
        return { err: null, message: 'Get events ok!', events: result[0][0] };
      }
      return { err: null, message: 'Get events ok!', events: null };
    } catch (e) {
      return ({ err: 'Error when getting events', message: '', events: '' });
    }
  },

  async addEvent(date, location, preferences, media, eventName, eventDesc) {
    const { lng, lat } = location;
    const uuidLocation = uuidv4();
    const uuidMedia = uuidv4();

    let realDate;
    if (!date || date < Date.now()) { realDate = Date.now(); } else {
      realDate = date;
    }

    try {
      await dbconnexion.media.create({
        ID_MEDIA: uuidMedia,
        MEDIA_TYPE: media.type,
        MEDIA_CONTENT: media.content,
      });
    } catch (e) {
      throw e;
    }

    try {
      await dbconnexion.location.create({
        ID_LOCATION: uuidLocation,
        LOC_DISCTRICT: 0,
        LOC_LONGITUDE: lng,
        LOC_LATITUDE: lat,
      });
    } catch (e) {
      throw e;
    }

    try {
      await dbconnexion.event.create({
        ID_EVENT: uuidv4,
        EVENT_NAME: eventName,
        EVENT_DESC: eventDesc,
        EVENT_USER: null,
        EVENT_LOCATION: uuidLocation,
        EVENT_MEDIA: uuidMedia,
      });
    } catch (e) {
      throw e;
    }

    return ({ message: 'create event success' });
  },
};

export default dbService;
