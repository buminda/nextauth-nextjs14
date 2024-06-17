import { getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt';

export default async (req, res) => {
  const session = await getSession({ req });

  if (!session) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  const token = await getToken({ req });

  if (!token) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  const keycloakLogoutUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout?post_logout_redirect_uri=${process.env.NEXTAUTH_URL}&id_token_hint=${token.idToken}`;

  res.writeHead(302, { Location: keycloakLogoutUrl });
  res.end();
};