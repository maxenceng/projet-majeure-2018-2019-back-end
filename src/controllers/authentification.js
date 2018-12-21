import webtoken from '../middlewares/webtoken';

const authController = {
  signInWithUsername(username, password, db, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signInWithUsername', WT);
    };
    db.sendRequest('request TODO', cb);
  },

  signInWithEmail(email, password, db, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signInWithEmail', WT);
    };
    db.sendRequest('request TODO', cb);
  },

  signUp(username, password, email, db, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signUp', WT);
    };
    db.sendRequest('request TODO', cb);
  },
};

export default authController;
