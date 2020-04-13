const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const bodyParser = express.json();

authRouter.post('/login', bodyParser, (req, res, next) => {
  res.send('ok');
});

module.exports = authRouter;
