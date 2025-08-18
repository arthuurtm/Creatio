import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { checkIfUserIsValid } from '../helpers/query.js';
import { createUserClientSession } from './ClientSessionService.js';
import UAParser from 'ua-parser-js';

async function handleLogin(type, identification, password, userAgent) {
  const parser = new UAParser();
  const device = parser.setUA(userAgent).getResult();
  let user;

  switch (type) {
    case 'traditional': {
      user = await User.findOne({ where: checkIfUserIsValid(identification) });
      if (!user) throw new Error('Usuário não encontrado.');

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) throw new Error('Senha inválida.');
      break;
    }

    case 'google': {
      const client = new OAuth2Client(process.env.VITE_GCLIENT_LOGIN_ID);
      const ticket = await client.verifyIdToken({
        idToken: identification,
        audience: process.env.VITE_GCLIENT_LOGIN_ID,
      });
      const payload = ticket.getPayload();
      user = await User.findOne({ where: { email: payload.email } });
      if (!user) throw new Error('Usuário não encontrado.');
      break;
    }

    default:
      throw new Error('Tipo de login inválido.');
  }

  const { accessToken, refreshToken } = await createUserClientSession(user.id, device);

  return {
    accessToken,
    refreshToken,
    accessCookieConfig: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000,
    },
    refreshCookieConfig: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  };
}

export default { handleLogin };
