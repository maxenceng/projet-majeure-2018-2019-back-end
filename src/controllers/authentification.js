import webtoken from '../middlewares/webtoken';

const AuthController = {
  signIn(req, res) {
    const payload = {
      admin: false,
    };
    const options = {
      subject: 'weme.com',
    };
    const WT = webtoken.signToken(payload, options);
    res.send(WT);
  },
  signUp(req, res) {
    res.send(req.params);
    let ret = 'signUp';
    if (req.params.login === 'abdel' && req.params.password === 'azer') {
      ret = 'authentification réussie';
    }
    res.send(ret);
  },
};

export default AuthController;
