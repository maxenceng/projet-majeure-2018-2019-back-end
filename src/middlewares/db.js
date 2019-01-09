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

    // TODO faire ça après l'init de la db
    this.init();
  }

  // Initialisation DB
  init() {
    this.db
      .authenticate()
      .then(() => {
        this.model();
      })
      .then(() => {
        // Drop tables (pour ajuster le modèle)
        // this.dropTables();
        // Synchronisation du modèle
      })
      .catch((err) => {
        console.log('error connexion with database');
        console.log(err);
      });
  }

  /**
   * A supprimmer !!! Juste pour reset la database rapidement
   */
  dropTables() {
    this.db.query('drop table events')
      .then(() => { this.db.query('drop table users'); })
      .then(() => { this.db.query('drop table conversations'); })
      .then(() => { this.db.query('drop table media'); })
      .then(() => { this.db.query('drop table locations'); })
      .then(() => { this.db.query('drop table profiles'); })
      .then(() => { this.db.query('drop table messages'); })
      .then(() => { this.db.query('drop table tags'); })
      .then(() => { this.db.query('drop table conv_user'); })
      .then(() => { this.db.query('drop table event_users'); });
  }

  // On map la base de données distante
  model() {
    this.tag = this.db.define('TAG', {
      ID_TAG: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      // wtf type
      TAG_TEXT: Sequelize.STRING,
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.profile = this.db.define('PROFILE', {
      ID_PROFILE: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      PROFILE_DESC: Sequelize.STRING,
      // wtf type
      PROFILE_AVATAR: Sequelize.STRING,
      PROFILE_TAG: { type: Sequelize.DataTypes.UUID, references: { model: this.tag, key: 'ID_TAG', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.location = this.db.define('LOCATION', {
      ID_LOCATION: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      LOC_DISTRICT: Sequelize.BIGINT,
      LOC_LONGITUDE: { type: Sequelize.NUMERIC, validate: { max: 180, min: -180 } },
      LOC_ATTITUDE: { type: Sequelize.NUMERIC, validate: { max: 90, min: -90 } },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.message = this.db.define('MESSAGE', {
      ID_MESSAGE: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      MES_DATE: Sequelize.DATE,
      MES_AUTHOR: Sequelize.STRING,
      MES_CONTENT: Sequelize.STRING,
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.media = this.db.define('MEDIA', {
      IID_MEDIA: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      MEDIA_TYPE: Sequelize.STRING(20),
      // wtf type
      MEDIA_CONTENT: Sequelize.STRING,
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.user = this.db.define('USER', {
      ID_USER: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      USER_FIRSTNAME: Sequelize.STRING,
      USER_NAME: Sequelize.STRING,
      // wtf type
      USER_EMAIL: { type: Sequelize.STRING, validate: { isEmail: true } },
      USER_PWD: Sequelize.STRING,
      USER_PROFILE: { type: Sequelize.DataTypes.UUID, references: { model: this.profile, key: 'ID_PROFILE', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.event = this.db.define('EVENT', {
      ID_EVENT: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      EVENT_NAME: Sequelize.STRING(255),
      EVENT_DESC: Sequelize.STRING(255),
      EVENT_MEDIA: { type: Sequelize.DataTypes.UUID, references: { model: this.media, key: 'ID_MEDIA', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
      EVENT_USER: Sequelize.BIGINT,
      EVENT_LOCATION: { type: Sequelize.DataTypes.UUID, references: { model: this.location, key: 'ID_LOCATION', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.conversation = this.db.define('CONVERSATION', {
      ID_CONVERSATION: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      CONV_MESSAGE: { type: Sequelize.DataTypes.UUID, references: { model: this.message, key: 'ID_MESSAGE', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    // n to n relations, tables de jointures
    this.eventUser = this.db.define('event_user', {
      STATUS: Sequelize.BOOLEAN,
    }, {
      freezeTableName: true,
      timestamps: false,
    });
    this.user.belongsToMany(this.event, { through: 'event_user', foreignKey: 'ID_USER', otherKey: 'ID_EVENT' });
    this.user.belongsToMany(this.conversation, { through: 'conv_user', foreignKey: 'ID_USER', otherKey: 'ID_CONVERSATION' });
  }
}

export default DBConnexion;
