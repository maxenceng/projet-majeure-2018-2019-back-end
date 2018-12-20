import jwt from 'jsonwebtoken';
import fs from 'fs';

const privateKEY = fs.readFileSync('src/config/private.key', 'utf8');
const publicKEY = fs.readFileSync('src/config/public.key', 'utf8');

module.exports = {
  signToken: (payload) => {
  // Token signing options
    const signOptions = {
      issuer: 'WeMe Server',
      subject: 'weme.com',
      expiresIn: '12h',
      algorithm: 'HS256',
    };

    return jwt.sign(payload, publicKEY, signOptions);
  },
  verifyToken: (token) => {
    const verifyOptions = {
      issuer: 'WeMe Server',
      subject: 'weme.com',
      expiresIn: '12h',
      algorithm: 'HS256',
    };
    try {
      return jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
      return false;
    }
  },
  decode: token => jwt.decode(token, { complete: true }),
};
