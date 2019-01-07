import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';

const authController = {
  signInWithUsername(username, password, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signInWithUsername', WT);
    };
    dbService.getUser(cb);
  },

  signInWithEmail(email, password, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signInWithEmail', WT);
    };
    dbService.getUser(cb);
  },

  signUp(firstname, name, password, email, res) {
    // To modif
    // On vérifie que les informations n'existent pas déja
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signUp', WT);
    };
    dbService.createUser(firstname, name, password, email, null, cb);
  },
};

export default authController;
