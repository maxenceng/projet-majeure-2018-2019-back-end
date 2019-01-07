import DBConnexion from '../middlewares/db';

const dbconnexion = new DBConnexion();

/**
 * Service permettant de simuler l'interface avec la base de donnée
 * Pour le moment la base de donnée est directement accessible via node
 * Dans le futur elle pourra être accessible via spring (maybe)
 * Il suffira du modifier ce service pour taper sur les routes
 */
const dbController = {
  getUser(email, password, callback) {
    dbconnexion.db.query(`SELECT * FROM USERS WHERE USER_PWD = '${password}' AND USER_EMAIL = '${email}'`).then((result) => {
      callback(result[0]);
    }).catch((err) => {
      console.error(err);
    });
  },

  createUser(firstname, name, email, pwd, profile, callback) {
    dbconnexion.db.sync()
      .then(() => dbconnexion.user.create({
        id_user: 2,
        user_firstname: firstname,
        user_name: name,
        user_email: email,
        user_pwd: pwd,
        user_profile: profile,
      }))
      .then((user) => {
        console.log(user.toJSON());
        callback();
      }).catch((err) => {
        console.error(err);
      });
  },
};

export default dbController;
