const express = require('express');
const path = require('path');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');

const postsRouter = express.Router();
const bodyParser = express.json();

postsRouter
  .route('/')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const { search, location } = req.query;

    if (!search && !location) {
      try {
        const posts = await PostsService.getAllPosts(req.app.get('db'));
        res.json(posts);
      } catch (e) {
        next(e);
      }
    }

    try {
      console.log('location is', location);
      const posts = await PostsService.getSearchPosts(
        req.app.get('db'),
        search,
        location
      );
      res.json(posts);
    } catch (e) {
      next(e);
    }
  })
  .post(bodyParser, async (req, res, next) => {
    const { title, description, device, condition, location } = req.body;

    const newPost = {
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

    newPost.user_id = req.user.id;

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
