import Sequelize from 'sequelize';
import configServer from '../config/configDB.json';

/**
 * Classe qui créer le lien avec la base de données postgres
 */
class DBConnexion {
  constructor() {
    this.db = new Sequelize(configServer.config.project,
      configServer.config.user,
      configServer.config.mdp, {
        host: configServer.config.address,
        dialect: 'postgres',
        operatorsAliases: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
  }

  // Test la connnexion à la base de données
  test() {
    this.db
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });
  }

  // TODO !!!
  sendRequest(request) {
    this.db.sendTruc(request);
  }
}

export default DBConnexion;
