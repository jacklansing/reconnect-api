const express = require('express');
const path = require('path');
const UsersService = require('./users-service');
const AuthService = require('../auth/auth-service');

const usersRouter = express.Router();
const bodyParser = express.json();

usersRouter.post('/', bodyParser, async (req, res, next) => {
  const { password, user_name, display_name, user_type } = req.body;

  for (const field of ['user_name', 'password', 'user_type', 'display_name']) {
    if (!req.body[field]) {
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });
    }
  }

  const passwordError = UsersService.validatePassword(password);

  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }

  try {
    const hasUserWithUserName = await UsersService.hasUserWithUsername(
      req.app.get('db'),
      user_name
    );

    if (hasUserWithUserName) {
      return res.status(400).json({ error: `Username already taken` });
    }

    const hashedPw = await UsersService.hashPassword(password);

    const newUser = {
      user_name,
      password: hashedPw,
      display_name,
      user_type,
      date_created: 'now()'
    };

    await UsersService.insertUser(req.app.get('db'), newUser);

    // Send the new user back an auth token so they may log in immediately.
    const dbUser = await AuthService.getUserWithUserName(
      req.app.get('db'),
      user_name
    );
    const sub = dbUser.user_name;
    const payload = { user_id: dbUser.id };
    res.status(201).send({
      authToken: AuthService.createJwt(sub, payload)
    });
  } catch (e) {
    next(e);
  }
});

module.exports = usersRouter;
