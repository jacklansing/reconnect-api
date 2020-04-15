const express = require('express');
const path = require('path');
const MessagesService = require('./messages-service');
const { requireAuth } = require('../middleware/jwt-auth');
const messagesRouter = express.Router();
const bodyParser = express.json();

messagesRouter
  .route('/')
  .all(requireAuth)
  .post(bodyParser, async (req, res, next) => {
    const { content, thread_id } = req.body;
    const newMessage = { content, thread_id };

    for (const [key, value] of Object.entries(newMessage)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    const author_id = req.user.id;
    newMessage.author_id = author_id;

    try {
      const message = await MessagesService.postNewMessage(
        req.app.get('db'),
        newMessage
      );

      // Get display name of the person entering new message.
      // For use client-side
      const display_name = req.user.display_name;
      message.display_name = display_name;
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${message.id}`))
        .json(MessagesService.serializeMessage(message));
    } catch (e) {
      next(e);
    }
  });

module.exports = messagesRouter;
