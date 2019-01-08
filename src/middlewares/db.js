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
        // Synchronisation du modèle
        this.db.sync();
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
    this.db.query('drop table tags')
      .then(() => { this.db.query('drop table profiles'); })
      .then(() => { this.db.query('drop table messages'); })
      .then(() => { this.db.query('drop table conversations'); })
      .then(() => { this.db.query('drop table users'); })
      .then(() => { this.db.query('drop table media'); })
      .then(() => { this.db.query('drop table locations'); })
      .then(() => { this.db.query('drop table event'); });
  }

  // On map la base de données distante
  model() {
    this.tag = this.db.define('tag', {
      id_tag: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      // wtf type
      tag_text: Sequelize.STRING,
    });

    this.profile = this.db.define('profile', {
      id_profile: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      profile_desc: Sequelize.STRING,
      // wtf type
      profile_avatar: Sequelize.STRING,
      profile_tag: { type: Sequelize.DataTypes.UUID, references: { model: this.tag, key: 'id_tag', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    });

    this.location = this.db.define('location', {
      id_location: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      loc_district: Sequelize.BIGINT,
      loc_longitude: { type: Sequelize.NUMERIC, validate: { max: 180, min: -180 } },
      loc_latitude: { type: Sequelize.NUMERIC, validate: { max: 90, min: -90 } },
    });

    this.message = this.db.define('message', {
      id_message: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      mes_date: Sequelize.DATE,
      mes_author: Sequelize.STRING,
      mes_content: Sequelize.STRING,
    });

    this.media = this.db.define('media', {
      id_media: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      media_type: Sequelize.STRING(20),
      // wtf type
      media_content: Sequelize.STRING,
    });

    this.user = this.db.define('user', {
      id_user: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      user_firstname: Sequelize.STRING,
      user_name: Sequelize.STRING,
      // wtf type
      user_email: { type: Sequelize.STRING, validate: { isEmail: true } },
      user_pwd: Sequelize.STRING,
      user_profile: { type: Sequelize.DataTypes.UUID, references: { model: this.profile, key: 'id_profile', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    });

    this.event = this.db.define('event', {
      id_event: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      event_name: Sequelize.STRING(255),
      event_desc: Sequelize.STRING(255),
      event_media: { type: Sequelize.DataTypes.UUID, references: { model: this.media, key: 'id_media', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
      event_user: Sequelize.BIGINT,
      event_location: { type: Sequelize.DataTypes.UUID, references: { model: this.location, key: 'id_location', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    });

    this.conversation = this.db.define('conversation', {
      id_conversation: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      conv_message: { type: Sequelize.DataTypes.UUID, references: { model: this.message, key: 'id_message', deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE } },
    });

    this.db.define('event_user', {
      // clef primaire + clef étrangère ?
      id_event: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      // clef primaire + clef étrangère ?
      id_user: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      // wtf type
      status: Sequelize.STRING,
    });

    this.db.define('conv_user', {
      // clef primaire + clef étrangère ?
      id_conv: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      // clef primaire + clef étrangère ?
      id_user: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
    });
  }
}

export default DBConnexion;
