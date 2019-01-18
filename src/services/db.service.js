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
      result = await dbconnexion.db.query(`SELECT "ID_USER"
      FROM "USER" WHERE "USER_PWD" = '${hashpwd}' AND "USER_EMAIL" = '${email}'`);
    } catch (e) { throw e; }
    return result;
  },

  async createUser(uuidUser, firstname, name, email, pwd) {
    // password hashé sale!
    const hash = crypto.createHash('sha256');
    hash.update(pwd + email);
    const hashpwd = hash.digest('hex');
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
          USER_ROLE: false,
        });

        await dbconnexion.profile.create({
          ID_PROFILE: uuidProfile,
          PROFILE_DESC: '',
          PROFILE_AVATAR: '',
          PROFILE_USER: uuidUser,
        });

        await dbconnexion.tag.create({
          TAG_TEXT: '',
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

  async createMessage(message, idExp, idDest) {
    // Fonction permettant de créer une conv
    const createConv = async (uuidConv, idUser) => {
      try {
        await dbconnexion.convUser.create({
          ID_CONV: uuidConv,
          ID_USER: idUser,
        });
      } catch (e) { throw e; }
    };

    const requestConvUserExistence = `(SELECT c."ID_CONVERSATION" FROM "CONVERSATION" c
    JOIN "CONV_USER" cu ON cu."ID_CONV" = c."ID_CONVERSATION"
    WHERE cu."ID_USER" = '${idDest}')
    INTERSECT
    (SELECT c2."ID_CONVERSATION" FROM "CONVERSATION" c2
    JOIN "CONV_USER" cu2 ON cu2."ID_CONV" = c2."ID_CONVERSATION"
    WHERE cu2."ID_USER" = '${idExp}')`;

    // Check pour savoir si une conversation n'existe pas déjà
    let existenceConv;
    try {
      existenceConv = await dbconnexion.db.query(requestConvUserExistence);
    } catch (e) {
      throw e;
    }

    let idConv;
    // Si la conversation n'existe pas déjà on créé une conversation entre les deux utilisateurs
    if (!existenceConv || existenceConv[0].length === 0) {
      const uuidConv = uuidv4();
      try {
        await dbconnexion.conversation.create({ ID_CONVERSATION: uuidConv });
        await createConv(uuidConv, idDest);
        await createConv(uuidConv, idExp);
      } catch (e) {
        throw e;
      }
      idConv = uuidConv;
    } else { idConv = existenceConv[0][0].ID_CONVERSATION; }

    // On créé le message correspondant
    try {
      await dbconnexion.message.create({
        MES_CONV: idConv,
        MES_AUTHOR: idExp,
        // miliseconds depuis le 1 er janvier 1970
        MES_DATE: Date.now(),
        MES_CONTENT: message,
      });
    } catch (e) {
      throw e;
    }
  },

  async userConv(idUser) {
    const request = `SELECT cu."ID_CONV" from "CONV_USER" cu
    WHERE cu."ID_USER" = '${idUser}'`;

    const UsersInConv = {};

    const researchUserInConv = async (idConv) => {
      const requestUser = `SELECT u."USER_FIRSTNAME", u."USER_NAME", u."ID_USER"
      FROM "CONV_USER" cu
      JOIN "USER" u ON cu."ID_USER" = u."ID_USER"
      WHERE cu."ID_CONV" = '${idConv}' AND u."ID_USER" != '${idUser}'`;

      try {
        const res = await dbconnexion.db.query(requestUser);
        if (res && res[0].length !== 0 && res[0][0] !== idUser) {
          UsersInConv[res[0][0].ID_USER] = {
            USER_FIRSTNAME: res[0][0].USER_FIRSTNAME,
            USER_NAME: res[0][0].USER_NAME,
          };
        }
      } catch (e) {
        throw e;
      }
    };

    let result;
    try {
      result = await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }

    if (result && result[0].length !== 0) {
      await Promise.all(result[0].map(async (conv) => {
        try {
          return await researchUserInConv(conv.ID_CONV);
        } catch (e) {
          throw e;
        }
      }));
    }
    console.log(UsersInConv);
    return UsersInConv;
  },

  async getMessages(idUser, idSecondUser) {
    const request = `(SELECT m."MES_CONTENT", m."MES_AUTHOR", m."MES_DATE"
      FROM "MESSAGE" m
      JOIN "CONVERSATION" c ON m."MES_CONV" = c."ID_CONVERSATION"
      JOIN "CONV_USER" cu ON cu."ID_CONV" = c."ID_CONVERSATION"
      WHERE cu."ID_USER" = '${idUser}')
      INTERSECT
      (SELECT m2."MES_CONTENT", m2."MES_AUTHOR", m2."MES_DATE"
      FROM "MESSAGE" m2
      JOIN "CONVERSATION" c2 ON m2."MES_CONV" = c2."ID_CONVERSATION"
      JOIN "CONV_USER" cu2 ON cu2."ID_CONV" = c2."ID_CONVERSATION"
      WHERE cu2."ID_USER" = '${idSecondUser}')`;

    try {
      return await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
  },

  async profileUser(idUser) {
    const request = `SELECT p."PROFILE_DESC", p."PROFILE_AVATAR", t."TAG_TEXT", u."USER_FIRSTNAME", u."USER_NAME"
    FROM "USER" u
    JOIN "PROFILE" p ON p."PROFILE_USER" = u."ID_USER"
    JOIN "TAG" t ON t."TAG_PROFILE" = p."ID_PROFILE"
    WHERE u."ID_USER" = '${idUser}'`;
    let profile;
    try {
      profile = await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
    return profile;
  },

  async updateProfile(idUser, linkPicture, description, tags, firstname, lastname) {
    const request = `
    UPDATE "PROFILE" AS p
    SET "PROFILE_DESC" = '${description}', 
    "PROFILE_AVATAR" = '${linkPicture}'
    FROM "USER" AS u
    WHERE p."PROFILE_USER" = u."ID_USER"
    AND u."ID_USER" = '${idUser}'`;
    // On update la description de l'utilisateur

    const updateUser = `
    UPDATE "USER" AS u
    SET "USER_FIRSTNAME" = '${firstname}', 
    "USER_NAME" = '${lastname}'
    WHERE u."ID_USER" = '${idUser}'`;

    // Update profile
    try {
      await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }

    // Update username and lastname
    try {
      await dbconnexion.db.query(updateUser);
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
    if (!result || result[0].length === 0) { throw new Error('Profile not found'); }

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

    let request = `SELECT l."LOC_LATITUDE", l."LOC_LONGITUDE", e."ID_EVENT", e."EVENT_DATE", l."LOC_DISTRICT",
    e."EVENT_DESC", e."EVENT_NAME", m."MEDIA_TYPE", m."MEDIA_CONTENT", t."TAG_TEXT" FROM "EVENT" e
    JOIN "LOCATION" l ON e."ID_EVENT" = l."LOC_EVENT"
    JOIN "MEDIA" m on e."ID_EVENT" = m."MEDIA_EVENT"
    JOIN "TAG" t on t."TAG_EVENT" = e."ID_EVENT"
    AND l."LOC_LATITUDE" < ${lat + 1} AND l."LOC_LATITUDE" > ${lat - 1}
    AND l."LOC_LONGITUDE" < ${lng + 1} AND l."LOC_LONGITUDE" > ${lng - 1}`;
    // AND e."EVENT_DATE" > ${realDate} AND e."EVENT_DATE" < ${realDate + 1000 * 3600 * 24 * 300}`;

    const requestPreferences = async preference => ` t."TAG_TEXT" = '${preference}' OR `;

    if (tags) {
      request += ' AND';
      await Promise.all(tags.map(async (pref) => {
        request += await requestPreferences(pref);
      }));
      request = request.substring(0, request.length - 4);
      request += ' LIMIT 40';
    }

    try {
      return await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
  },

  async eventsByName(name) {
    const request = `SELECT l."LOC_LATITUDE", l."LOC_LONGITUDE", e."ID_EVENT", e."EVENT_DATE", l."LOC_DISTRICT",
    e."EVENT_DESC", e."EVENT_NAME", m."MEDIA_TYPE", m."MEDIA_CONTENT", t."TAG_TEXT" FROM "EVENT" e
    JOIN "LOCATION" l ON e."ID_EVENT" = l."LOC_EVENT"
    JOIN "MEDIA" m on e."ID_EVENT" = m."MEDIA_EVENT"
    JOIN "TAG" t on t."TAG_EVENT" = e."ID_EVENT"
    WHERE e."EVENT_NAME" LIKE '%${name}%'`;

    try {
      return await dbconnexion.db.query(request);
    } catch (e) {
      throw e;
    }
  },

  async addEvent(date, location, city, tags, media, eventName, eventDesc) {
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
        LOC_DISTRICT: city,
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

  async participateEvent(idUser, idEvent) {
    let existence;
    const requestExistance = `SELECT * FROM "EVENT_USER" 
      WHERE "ID_USER" = '${idUser}' 
      AND "ID_EVENT" = '${idEvent}'`;

    try {
      existence = await dbconnexion.db.query(requestExistance);
    } catch (e) {
      throw e;
    }

    // On check si il participe déja
    if (existence && existence[0].length !== 0) {
      const requestUpdateParticipation = `UPDATE "EVENT_USER" eu
      SET "PARTICIPATE" = true
      WHERE "ID_USER" = '${idUser}' 
      AND "ID_EVENT" = '${idEvent}'`;

      try {
        await dbconnexion.db.query(requestUpdateParticipation);
      } catch (e) {
        throw e;
      }
    } else {
      try {
        await dbconnexion.eventUser.create({
          ID_USER: idUser,
          ID_EVENT: idEvent,
          PARTICIPATE: true,
          FAVORITE: false,
        });
      } catch (e) {
        throw e;
      }
    }

    return true;
  },

  async removeParticipation(idUser, idEvent) {
    const requestCancelParticipation = `UPDATE "EVENT_USER" eu
      SET "PARTICIPATE" = false
      WHERE "ID_USER" = '${idUser}' 
      AND "ID_EVENT" = '${idEvent}'`;

    try {
      await dbconnexion.db.query(requestCancelParticipation);
    } catch (e) {
      throw e;
    }

    return true;
  },

  async userParticipateEvent(idUser, idEvent) {
    const requestExistance = `SELECT * FROM "EVENT_USER" eu
    WHERE "ID_USER" = '${idUser}' AND "ID_EVENT" = '${idEvent}' AND "PARTICIPATE" = true`;

    let existence;
    try {
      existence = await dbconnexion.db.query(requestExistance);
    } catch (e) {
      throw e;
    }
    // On check si il participe déja
    if (!existence || existence[0].length === 0) { return false; }
    return true;
  },

  async favoriteEvent(idUser, idEvent) {
    let existence;
    const requestExistance = `SELECT * FROM "EVENT_USER" 
      WHERE "ID_USER" = '${idUser}' 
      AND "ID_EVENT" = '${idEvent}'`;

    try {
      existence = await dbconnexion.db.query(requestExistance);
    } catch (e) {
      throw e;
    }

    // On check si il participe déja
    if (existence && existence[0].length !== 0) {
      const requestUpdateParticipation = `UPDATE "EVENT_USER" eu
      SET "FAVORITE" = true
      WHERE "ID_USER" = '${idUser}' 
      AND "ID_EVENT" = '${idEvent}'`;

      try {
        await dbconnexion.db.query(requestUpdateParticipation);
      } catch (e) {
        throw e;
      }
    } else {
      try {
        await dbconnexion.eventUser.create({
          ID_USER: idUser,
          ID_EVENT: idEvent,
          PARTICIPATE: false,
          FAVORITE: true,
        });
      } catch (e) {
        throw e;
      }
    }
  },

  async removeFavorite(idUser, idEvent) {
    const requestCancelParticipation = `UPDATE "EVENT_USER" eu
      SET "FAVORITE" = false
      WHERE "ID_USER" = '${idUser}' 
      AND "ID_EVENT" = '${idEvent}'`;

    try {
      await dbconnexion.db.query(requestCancelParticipation);
    } catch (e) {
      throw e;
    }

    return true;
  },

  async userFavoriteEvent(idUser, idEvent) {
    const requestExistance = `SELECT * FROM "EVENT_USER" eu
    WHERE "ID_USER" = '${idUser}' AND "ID_EVENT" = '${idEvent}' AND "FAVORITE" = true`;

    let existence;
    try {
      existence = await dbconnexion.db.query(requestExistance);
    } catch (e) {
      throw e;
    }
    // On check si il participe déja
    if (!existence || existence[0].length === 0) { return false; }
    return true;
  },

  async userEvents(idUser) {
    const request = `SELECT m."MEDIA_CONTENT", m."MEDIA_TYPE", e."EVENT_NAME", e."EVENT_DATE", e."ID_EVENT", e."EVENT_DESC" FROM "EVENT" e 
    JOIN "EVENT_USER" eu ON eu."ID_EVENT" = e."ID_EVENT"
    JOIN "MEDIA" m on e."ID_EVENT" = m."MEDIA_EVENT"
    WHERE eu."ID_USER" ='${idUser}'`;

    try {
      const results = await dbconnexion.db.query(request);
      if (!results || results[0].length === 0) { return null; }
      return results[0];
    } catch (e) {
      throw e;
    }
  },

  async eventParticipate(idEvent) {
    const request = `SELECT u."ID_USER", u."USER_FIRSTNAME", u."USER_NAME", p."PROFILE_AVATAR", p."PROFILE_DESC"
    FROM "EVENT_USER" eu
    JOIN "USER" u ON eu."ID_USER" = u."ID_USER"
    JOIN "PROFILE" p ON p."PROFILE_USER" = u."ID_USER"
    WHERE eu."PARTICIPATE" = true AND eu."ID_EVENT" = '${idEvent}'
    LIMIT 100`;

    try {
      const results = await dbconnexion.db.query(request);
      if (!results || results[0].length === 0) { return null; }
      return results[0];
    } catch (e) {
      throw e;
    }
  },

  async eventFavorites(idEvent) {
    const request = `SELECT eu."ID_USER", u."USER_FIRSTNAME", u."USER_NAME", p."PROFILE_AVATAR", p."PROFILE_DESC"
    FROM "EVENT_USER" eu
    JOIN "USER" u ON eu."ID_USER" = u."ID_USER"
    JOIN "PROFILE" p ON p."PROFILE_USER" = u."ID_USER"
    WHERE eu."FAVORITE" = true AND eu."ID_EVENT" = '${idEvent}'
    LIMIT 100`;

    try {
      const results = await dbconnexion.db.query(request);
      if (!results || results[0].length === 0) { return null; }
      return results[0];
    } catch (e) {
      throw e;
    }
  },

  async userInterrestedEvent(idEvent) {
    const request = `SELECT eu."ID_USER", u."USER_FIRSTNAME", u."USER_NAME", p."PROFILE_AVATAR", p."PROFILE_DESC"
      FROM "EVENT_USER" eu
      JOIN "EVENT" e ON e."ID_EVENT" = '${idEvent}'
      JOIN "TAG" te ON e."ID_EVENT" = te."TAG_EVENT"
      JOIN "USER" u ON eu."ID_USER" = u."ID_USER"
      JOIN "PROFILE" p ON p."PROFILE_USER" = u."ID_USER"
      JOIN "TAG" tu ON tu."TAG_PROFILE" = p."ID_PROFILE"
      WHERE tu."TAG_TEXT" = te."TAG_TEXT"
      LIMIT 100`;

    try {
      const results = await dbconnexion.db.query(request);
      if (!results || results[0].length === 0) { return null; }
      return results[0];
    } catch (e) {
      throw e;
    }
  },
};

export default dbService;
