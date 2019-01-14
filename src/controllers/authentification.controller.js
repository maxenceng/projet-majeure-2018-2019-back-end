import webtoken from '../middlewares/webtoken';
import dbService from '../services/db.service';

const authController = {

  async signIn(email, password, res) {
    let result;
    try {
      result = await dbService.getUser(email, password);
    } catch (e) { throw e; }

    if (result[0].length !== 0) {
      const user = result[0];
      let admin = false;
      if (user.admin) { admin = true; }
      const payload = { admin };
      const WT = webtoken.signToken(payload);
      return res.status(200).send({ message: 'signIn sucess', token: WT, user });
    }
    return res.status(404).send({ err: 'User was not found!' });
  },

  async signUp(firstname, name, password, email, res) {
    let creation;
    try {
      creation = await dbService.createUser(firstname, name, email, password);
    } catch (e) { throw e; }
    const payload = {
      admin: false,
    };
    const WT = webtoken.signToken(payload);
    if (creation) { return res.status(200).send({ message: 'signUp', token: WT }); }
    return res.status(400).send({ err: 'User already exist' });
  },
};

export default authController;
