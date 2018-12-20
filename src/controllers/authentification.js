import webtoken from '../middlewares/webtoken';

const AuthController = {
  signIn(req, res) {
    const payload = {
      admin: false,
    };
    const WT = webtoken.signToken(payload);
    res.send(WT);
  },
  signUp(req, res) {
    let ret = 'signup failed!';
    if (webtoken.verifyToken(req.query.token)) {
      if (req.query.login === 'abdel' && req.query.password === 'azer') {
        ret = 'authentification réussie';
      }
    }
    res.send(ret);
  },
};

export default AuthController;
