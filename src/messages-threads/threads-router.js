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
      const threads = await ThreadsService.getThreadsByUser(
        req.app.get('db'),
        userId
      );
      res.json(threads);
    } catch (e) {
      next(e);
    }
  });

module.exports = threadsRouter;
