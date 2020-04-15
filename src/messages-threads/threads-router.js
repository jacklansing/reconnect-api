const express = require('express');
const ThreadsService = require('./threads-service');
const { requireAuth } = require('../middleware/jwt-auth');

const threadsRouter = express.Router();
const bodyParser = express.json();

threadsRouter
  .route('/')
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
      const thread = await ThreadsService.postNewThead(
        req.app.get('db'),
        participants
      );

      res.status(201).json(thread);
    } catch (e) {
      next(e);
    }
  })
  .get(async (req, res, next) => {
    const userId = req.user.id;
    try {
      const threads = await ThreadsService.getLatestThreadMessage(
        req.app.get('db'),
        userId
      );
      res.json(threads);
    } catch (e) {
      next(e);
    }
  });

threadsRouter
  .route('/:thread_id')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const { thread_id } = req.params;
    try {
      const messages = await ThreadsService.getAllThreadMessages(
        req.app.get('db'),
        thread_id
      );

      if (!messages) {
        res.status(400).send({
          error: `No messages found for thread with id ${thread_id}`
        });
      }

      res.json(messages);
    } catch (e) {
      next(e);
    }
  });

module.exports = threadsRouter;
