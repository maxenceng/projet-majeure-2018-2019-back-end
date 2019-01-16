import request from 'request-promise';

const generateRandomString = (length) => {
  const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$^ù!:;./§%¨£1234567890';

  let randomString = '';
  if (length && length > 0) {
    for (let i = 0; i < length; i += 1) {
      randomString += string.charAt(Math.floor(string.charAt(Math.random() * string.length)));
    }
  }
  return randomString;
};

const authRequest = async () => {
  const params = {
    clientId: '529637638584-qp9rgeeg1g0n63ml36kg572falfj6m1l.apps.googleusercontent.com',
    responseType: 'code',
    scope: 'openid email',
    redirectUri: 'http://localhost:3000',
    state: 'opakstring',
    nonce: generateRandomString(30),
  };

  const uri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${params.clientId}&response_type=${params.responseType}
      &scope=${params.scope}&redirect_uri=${params.redirectUri}&state=${params.state}&nonce=${params.nonce}`;

  try {
    const res = await request.get(uri);
    console.log(res);
  } catch (e) {
    console.error(e);
  }
};

export default authRequest;
