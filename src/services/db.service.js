import crypto from 'crypto';
import DBConnexion from '../middlewares/db';
import uniqueId from '../utils/uniqueId';

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
    // Generate unique interger
    const uniqId = uniqueId();
    // On check si l'utilisateur existe ou non
    dbconnexion.db.query(`SELECT * FROM "USER" WHERE "USER_EMAIL" = '${email}'`).then((result) => {
      if (result[0].length === 0) {
        // Création du profil associé à l'utilisateur
        dbconnexion.profile.create({
          ID_PROFILE: uniqId,
          PROFILE_DESC: 'hello',
          PROFILE_AVATAR: 'truc',
          PROFILE_TAG: uniqId,
        }).then(() => {
          // Création de l'utilisateur
          dbconnexion.user.create({
            ID_USER: uniqId,
            USER_FIRSTNAME: firstname,
            USER_NAME: name,
            USER_EMAIL: email,
            USER_PWD: hashpwd,
            USER_PROFILE: uniqId,
          }).catch((err) => {
            console.error(err);
            callback('Error append when creating user');
          });
        }).then((user) => {
          console.log(user);
          callback();
        }).catch((err) => {
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
      SET "PROFILE_AVATAR" = '${email}'
      FROM "USER" AS u
      WHERE p."ID_PROFILE" = u."USER_PROFILE"
      AND u."USER_EMAIL" = '${linkPicture}'`;
    // On update la description de l'utilisateur
    try {
      await dbconnexion.db.query(request);
      return { err: null, message: 'link picture profile updated!' };
    } catch (e) {
      return ({ err: 'Error during picture prodile update', message: '' });
    }
  },
};

export default dbService;
