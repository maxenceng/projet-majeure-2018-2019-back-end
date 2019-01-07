import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';

const authController = {
  signIn(email, password, res) {
    const cb = (result) => {
      if (result.length !== 0) {
        const user = result[0];
        let admin = false;
        if (user.admin) { admin = true; }
        const payload = { admin };
        const WT = webtoken.signToken(payload);
        res.status(200).send({ message: 'signIn sucess', token: WT, user });
      } else {
        res.status(400).send({ message: 'User was not found!' });
      }
    };
    dbService.getUser(email, password, cb);
  },

  signUp(firstname, name, password, email, res) {
    // TODO On vérifie que les informations n'existent pas déja
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send({ message: 'signUp', token: WT });
    };
    dbService.createUser(firstname, name, email, password, null, cb);
  },
};

export default authController;
