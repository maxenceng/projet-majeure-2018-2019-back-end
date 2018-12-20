const AuthController = {
  signIn(req, res) {
    res.send('signIn');
  },
  signUp(req, res) {
    res.send('signUp');
    if (req.params.login === 'abdel' && req.params.password === 'azer') {
      res.send('authentification réussie');
    }
  },
};

export default AuthController;
