const express = require('express');
const path = require('path');
const MessagesService = require('./messages-service');
const { requireAuth } = require('../middleware/jwt-auth');
const messagesRouter = express.Router();
const bodyParser = express.json();

messagesRouter.route('/').post(bodyParser, async (req, res, next) => {
  const { content, thread_id, author_id } = req.body;
  const newMessage = { content, thread_id, author_id };

  for (const [key, value] of Object.entries(newMessage)) {
    if (value == null) {
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });
    }
  }

  try {
    const message = await MessagesService.postNewMessage(
      req.app.get('db'),
      newMessage
    );

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${message.id}`))
      .json(MessagesService.serializeMessage(message));
  } catch (e) {
    next(e);
  }
});

messagesRouter
  .route('/new-thread')
  .all(requireAuth)
  .post(bodyParser, async (req, res, next) => {
    const { recipient_id } = req.body;

    if (!recipient_id) {
      return res.status(400).json({
        error: `Missing recipient_id in request body`
      });
    }

    const author_id = req.user.id;

    const participants = {
      recipient_id,
      author_id
    };

    try {
      const thread = await MessagesService.postNewThead(
        req.app.get('db'),
        participants
      );

      res.status(201).json({ thread });
    } catch (e) {
      next(e);
    }
  });

module.exports = messagesRouter;
