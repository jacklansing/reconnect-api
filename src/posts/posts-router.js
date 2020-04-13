const express = require('express');
const path = require('path');
const PostsService = require('./posts-service');

const postsRouter = express.Router();
const bodyParser = express.json();

postsRouter
  .route('/')
  .get(async (req, res, next) => {
    try {
      const posts = await PostsService.getAllPosts(req.app.get('db'));
      res.json(posts);
    } catch (e) {
      next(e);
    }
  })
  .post(bodyParser, async (req, res, next) => {
    const {
      user_id,
      title,
      description,
      device,
      condition,
      location
    } = req.body;

    const newPost = {
      user_id,
      title,
      description,
      device,
      condition,
      location
    };

    for (const [key, value] of Object.entries(newPost)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    //TODO: Grab user of request body once authentication middleware is implemented
    // For now we'll pick up the id artificially above

    try {
      const post = await PostsService.insertPost(req.app.get('db'), newPost);

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${post.id}`))
        .json(PostsService.serializePost(post));
    } catch (e) {
      next(e);
    }
  });

module.exports = postsRouter;
