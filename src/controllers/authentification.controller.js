import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';

const authController = {

  signIn(email, password, res) {
    const cb = (err, result) => {
      if (err) { res.status(401).send({ error: err }); }
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
    dbService.getUser(cb);
  },

  signUp(firstname, name, password, email, res) {
    // TODO On vérifie que les informations n'existent pas déja
    const cb = (err) => {
      if (err) { res.status(401).send({ error: err }); }
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
