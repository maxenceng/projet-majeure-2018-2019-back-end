import webtoken from '../middlewares/webtoken';

class AuthController {
  constructor(db) {
    this.db = db;
  }

  signInWithUsername(username, password, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signInWithUsername', WT);
    };
    this.db.sendRequest('request TODO', cb);
  }

  signInWithEmail(email, password, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signInWithEmail', WT);
    };
    this.db.sendRequest('request TODO', cb);
  }

  signUp(username, password, email, res) {
    // To modif
    const cb = () => {
      const payload = {
        admin: false,
      };
      const WT = webtoken.signToken(payload);
      res.status(200).send('signUp', WT);
    };
    this.db.sendRequest('request TODO', cb);
  }
}

export default AuthController;
