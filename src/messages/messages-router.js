const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const messagesRouter = express.Router();
const bodyParser = express.json();

messagesRouter.route('/').post(bodyParser, async (req, res, next) => {
  res.send('ok');
});

messagesRouter
  .route('/new-thread')
  .post(bodyParser, async (req, res, next) => {});

module.exports = messagesRouter;
