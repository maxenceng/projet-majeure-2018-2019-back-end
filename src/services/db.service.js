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
  async getUser(email, password) {
    // Hash du password
    const hash = crypto.createHash('sha256');
    hash.update(password + email);
    const hashpwd = hash.digest('hex');
    // Query DB
    let result;
    try {
      result = await dbconnexion.db.query(`SELECT "ID_USER", "USER_NAME", "USER_FIRSTNAME", 
      "USER_EMAIL" FROM "USER" WHERE "USER_PWD" = '${hashpwd}' AND "USER_EMAIL" = '${email}'`);
    } catch (e) { throw e; }
    return result;
  },

  async createUser(firstname, name, email, pwd) {
    // password hashé sale!
    const hash = crypto.createHash('sha256');
    hash.update(pwd + email);
    const hashpwd = hash.digest('hex');
    const uuidUser = uuidv4();
    const uuidProfile = uuidv4();
    // Generate unique interger
    // On check si l'utilisateur existe ou non
    let resultExistanceUser;
    try {
      resultExistanceUser = await dbconnexion.db.query(`SELECT * FROM "USER" WHERE "USER_EMAIL" = '${email}'`);
    } catch (e) {
      throw e;
    }
    if (resultExistanceUser[0].length === 0) {
      try {
        // Création de l'utilisateur
        await dbconnexion.user.create({
          ID_USER: uuidUser,
          USER_FIRSTNAME: firstname,
          USER_NAME: name,
          USER_EMAIL: email,
          USER_PWD: hashpwd,
        });

        await dbconnexion.profile.create({
          ID_PROFILE: uuidProfile,
          PROFILE_DESC: 'hello',
          PROFILE_AVATAR: 'truc',
          PROFILE_USER: uuidUser,
        });

        await dbconnexion.tag.create({
          TAG_TEXT: 'tagtag',
          TAG_PROFILE: uuidProfile,
        });
        // Création du profil associé à l'utilisateur

        return true;
      } catch (e) {
        throw e;
      }
    } else {
      return false;
    }
  },

  async createMessage(message, author, idDest) {
    const request = `SELECT c."ID_CONVERSATION" FROM "CONVERSATION" c 
      JOIN "CONV_USER" cu ON cu."ID_CONV" = c."ID_CONVERSATION"
      JOIN "USER" u ON cu."ID_USER" = u."ID_USER"
      WHERE u."ID_USER" = '${idDest}'`;
    let result;
    try {
      result = await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }

    // Si pas de destinataire trouvé sur la db on renvoie une erreur
    if (!result || result[0].length === 0) { throw new Error('Dest not found'); }

    try {
      await dbconnexion.message.create({
        ID_CONVERSATION: result[0].ID_CONVERSATION,
        MES_AUTHOR: author,
        // miliseconds depuis le 1 er janvier 1970
        MES_DATA: Date.now(),
        MES_MESSAGE: message,
      });
    } catch (e) {
      throw e;
    }
  },

  async getMessages(idUser) {
    const request = `SELECT * FROM "MESSAGE" m 
      JOIN "CONVERSATION" c ON m."MES_CONV" = c."ID_CONVERSATION"
      JOIN "CONV_USER" cu ON cu."ID_CONV" = c."ID_CONVERSATION"
      JOIN "USER" u ON cu."ID_USER" = u."ID_USER" 
      WHERE u."ID_USER" = '${idUser}'`;
    try {
      return await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
  },

  async profileUser(idUser) {
    const request = `SELECT p."PROFILE_DESC", p."PROFILE_AVATAR", t."TAG_TEXT"
      FROM "TAG" t
      JOIN "PROFILE" p ON t."TAG_PROFILE" = p."ID_PROFILE"
      JOIN "USER" u ON p."PROFILE_USER" = u."ID_USER"
      WHERE u."ID_USER" = '${idUser}'`;
    let profile;
    try {
      profile = await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
    return profile;
  },

  async updateProfile(idUser, linkPicture, description, tags) {
    const request = `
    UPDATE "PROFILE" AS p
    SET "PROFILE_DESC" = '${description}', 
    "PROFILE_AVATAR" = '${linkPicture}'
    FROM "USER" AS u
    WHERE p."PROFILE_USER" = u."ID_USER"
    AND u."ID_USER" = '${idUser}'`;
    // On update la description de l'utilisateur
    try {
      await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }

    const requestTags = `
      SELECT p."ID_PROFILE" FROM "PROFILE" AS p
      JOIN "USER" AS u ON u."ID_USER" = p."PROFILE_USER"
      WHERE u."ID_USER" = '${idUser}'`;
    // On cherche l'id du profil corrspondant à l'email
    let result;
    try {
      result = await dbconnexion.db.query(requestTags);
    } catch (e) {
      console.error(e);
      throw e;
    }

    // Si on ne trouve pas le profile en base de donnée on renvoir une erreur
    if (!result || result[0].length !== 0) { throw new Error('Profile not found'); }

    const profileId = result[0][0].ID_PROFILE;
    // On delete tous les anciens tags
    try {
      await dbconnexion.db.query(`DELETE FROM "TAG" WHERE "TAG_PROFILE" = '${profileId}'`);
    } catch (e) {
      throw e;
    }

    // On recréé tous les nouveaux tags
    tags.forEach(async (tag) => {
      try {
        await dbconnexion.tag.create({
          TAG_TEXT: tag,
          TAG_PROFILE: profileId,
        });
      } catch (e) {
        throw e;
      }
    });
  },

  async allEvents(date, location, tags) {
    const { lng, lat } = location;

    let realDate;
    if (!date || date < Date.now()) { realDate = Date.now(); } else {
      realDate = date;
    }

    let request = `SELECT * FROM "EVENT" e
    JOIN "LOCATION" l ON e."ID_EVENT" = l."LOC_EVENT"
    AND l."LOC_LATITUDE" < ${lat + 1} AND l."LOC_LATITUDE" > ${lat - 1}
    AND l."LOC_LONGITUDE" < ${lng + 1} AND l."LOC_LONGITUDE" > ${lng - 1}
    AND e."EVENT_DATE" > ${realDate} AND e."EVENT_DATE" < ${realDate + 1000 * 3600 * 24 * 10}`;

    const requestPreferences = async preference => `e."EVENT_TAG" = ${preference} OR`;

    // TODO faire plus plusieurs préférences
    if (tags) {
      request += 'AND';
      tags.forEach(async (pref) => {
        request += await requestPreferences(pref);
      });
      request = request.substring(0, request.length - 3);
    }

    try {
      return await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
  },

  async addEvent(date, location, tags, media, eventName, eventDesc) {
    const { lng, lat } = location;
    const uuidEvent = uuidv4();

    let realDate;
    if (!date || date < Date.now()) { realDate = Date.now(); } else {
      realDate = date;
    }

    try {
      await dbconnexion.event.create({
        ID_EVENT: uuidEvent,
        EVENT_NAME: eventName,
        EVENT_DESC: eventDesc,
        EVENT_DATE: realDate,
      });
    } catch (e) {
      throw e;
    }

    try {
      await dbconnexion.location.create({
        LOC_EVENT: uuidEvent,
        LOC_DISCTRICT: 0,
        LOC_LONGITUDE: lng,
        LOC_LATITUDE: lat,
      });
    } catch (e) {
      throw e;
    }

    try {
      await dbconnexion.media.create({
        MEDIA_EVENT: uuidEvent,
        MEDIA_TYPE: media.type,
        MEDIA_CONTENT: media.content,
      });
    } catch (e) {
      throw e;
    }

    tags.map(async (tag) => {
      try {
        await dbconnexion.tag.create({
          TAG_EVENT: uuidEvent,
          TAG_TEXT: tag,
        });
      } catch (e) {
        throw e;
      }
    });

    return true;
  },
};

export default dbService;
