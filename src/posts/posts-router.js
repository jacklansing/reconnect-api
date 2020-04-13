const express = require('express');
const PostsService = require('./posts-service');

const postsRouter = express.Router();
const bodyParser = express.json();

postsRouter.route('/').get(async (req, res, next) => {
  const posts = await PostsService.getAllPosts(req.app.get('db'));
  res.json(posts);
});

module.exports = postsRouter;
