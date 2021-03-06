const AuthService = require('../auth/auth-service');

async function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    // verifyJwt will throw an error when/if the secret is wrong
    const payload = AuthService.verifyJwt(bearerToken);

    try {
      const user = await AuthService.getUserWithUserName(
        req.app.get('db'),
        payload.sub
      );

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }

      req.user = user;
      next();
    } catch (e) {
      next(e);
    }
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
}

module.exports = {
  requireAuth
};
