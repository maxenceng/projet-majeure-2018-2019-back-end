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
        port: configServer.config.port,
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
        console.error('error connexion with database');
        console.error(err);
      });
  }

  // On map la base de données distante
  model() {
    this.tag = this.db.define('TAG', {
      ID_TAG: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      // wtf type
      TAG_TEXT: Sequelize.STRING,
      TAG_PROFILE: {
        type: Sequelize.DataTypes.UUID,
        references: { model: this.tag, key: 'ID_PROFILE', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE },
      },
      TAG_EVENT: {
        type: Sequelize.DataTypes.UUID,
        references: { model: this.tag, key: 'ID_EVENT', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE },
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.profile = this.db.define('PROFILE', {
      ID_PROFILE: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      PROFILE_DESC: Sequelize.STRING,
      // wtf type
      PROFILE_AVATAR: Sequelize.STRING,
      PROFILE_USER: {
        type: Sequelize.DataTypes.UUID,
        references: { model: this.tag, key: 'ID_USER', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE },
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.location = this.db.define('LOCATION', {
      ID_LOCATION: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      LOC_DISCTRICT: Sequelize.BIGINT,
      LOC_LONGITUDE: { type: Sequelize.NUMERIC, validate: { max: 180, min: -180 } },
      LOC_LATITUDE: { type: Sequelize.NUMERIC, validate: { max: 90, min: -90 } },
      LOC_EVENT: {
        type: Sequelize.DataTypes.UUID,
        references: { model: this.tag, key: 'ID_EVENT', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE },
      },
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
      MES_CONV: {
        type: Sequelize.DataTypes.UUID,
        references: { model: this.tag, key: 'ID_CONVERSATION', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE },
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.media = this.db.define('MEDIA', {
      ID_MEDIA: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      MEDIA_TYPE: Sequelize.STRING(20),
      // wtf type
      MEDIA_CONTENT: Sequelize.STRING,
      MEDIA_EVENT: {
        type: Sequelize.DataTypes.UUID,
        references: { model: this.tag, key: 'ID_EVENT', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE },
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.user = this.db.define('USER', {
      ID_USER: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      USER_FIRSTNAME: Sequelize.STRING,
      USER_NAME: Sequelize.STRING,
      // wtf type
      USER_EMAIL: { type: Sequelize.STRING, validate: { isEmail: true } },
      USER_PWD: Sequelize.STRING,
      USER_ROLE: Sequelize.BOOLEAN,
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    this.event = this.db.define('EVENT', {
      ID_EVENT: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      EVENT_NAME: Sequelize.STRING(255),
      EVENT_DESC: Sequelize.STRING(255),
      EVENT_DATE: Sequelize.BIGINT,
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
    }, {
      freezeTableName: true,
      timestamps: false,
    });

    // n to n relations, tables de jointures
    this.eventUser = this.db.define('EVENT_USER', {
      STATUS: Sequelize.BOOLEAN,
    }, {
      freezeTableName: true,
      timestamps: false,
    });
    this.user.belongsToMany(this.event, { through: 'EVENT_USER', foreignKey: 'ID_USER', otherKey: 'ID_EVENT' });
    this.user.belongsToMany(this.conversation, { through: 'CONV_USER', foreignKey: 'ID_USER', otherKey: 'ID_CONVERSATION' });
  }
}

export default DBConnexion;
