const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const messagesRouter = express.Router();
const bodyParser = express.json();

messagesRouter.route('/').post(async (req, res, next) => {
  res.send('ok');
});

module.exports = messagesRouter;
