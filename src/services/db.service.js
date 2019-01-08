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
      callback(null, result[0]);
    }).catch((err) => {
      // TODO Appeller un callback pour send une erreure
      console.error(err);
      callback('Error append when signIn');
    });
  },

  createUser(firstname, name, pwd, email, profile, callback) {
    dbconnexion.db.query(`SELECT * FROM USERS WHERE USER_PWD = '${pwd}' AND USER_EMAIL = '${email}'`).then((result) => {
      if (result[0].length === 0) {
        dbconnexion.user.create({
          id_user: 3,
          user_firstname: firstname,
          user_name: name,
          user_email: email,
          user_pwd: pwd,
          user_profile: profile,
        })
          .then((user) => {
            console.log(user.toJSON());
            callback();
          }).catch((err) => {
            console.error(err);
            callback('Error append when signUp');
          });
      } else {
        callback('User already exist!');
      }
    });
  },
};

export default dbController;
