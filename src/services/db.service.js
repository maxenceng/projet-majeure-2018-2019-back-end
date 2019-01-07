import DBConnexion from '../middlewares/db';

const dbconnexion = new DBConnexion();

/**
 * Service permettant de simuler l'interface avec la base de donnée
 * Pour le moment la base de donnée est directement accessible via node
 * Dans le futur elle pourra être accessible via spring (maybe)
 * Il suffira du modifier ce service pour taper sur les routes
 */
const dbController = {
  getUser(callback) {
    dbconnexion.db.query('SELECT * FROM USER').then((myTableRows) => {
      console.log(JSON.stringify(myTableRows));
      callback();
    });
  },

  createUser(firstname, name, email, pwd, profile, callback) {
    dbconnexion.db.sync()
      .then(() => this.user.create({
        // id_user: { type: Sequelize.BIGINT, primaryKey: true },
        user_firstname: firstname,
        user_name: name,
        user_email: email,
        user_pwd: pwd,
        user_profile: profile,
      }))
      .then((user) => {
        console.log(user.toJSON());
        callback();
      });
  },
};

export default dbController;
