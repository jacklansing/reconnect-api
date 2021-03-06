const express = require('express');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');

const path = require('path');
const {
  uploader,
  cloudinaryConfig
} = require('../middleware/cloudinary-config');
const { multerUploads, dataUri } = require('../middleware/multer-upload');

const postsRouter = express.Router();

postsRouter
  .route('/')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const { search, location } = req.query;

    if (!search && !location) {
      try {
        const posts = await PostsService.getAllPosts(req.app.get('db'));
        return res.json(
          posts.map(post => {
            post.user_id === req.user.id
              ? (post.userCanEdit = true)
              : (post.userCanEdit = false);
            return PostsService.serializePost(post);
          })
        );
      } catch (e) {
        next(e);
      }
    }

    if (!search && location) {
      try {
        const posts = await PostsService.getSearchPostsByLocation(
          req.app.get('db'),
          location
        );
        return res.json(
          posts.map(post => {
            post.user_id === req.user.id
              ? (post.userCanEdit = true)
              : (post.userCanEdit = false);
            return PostsService.serializePost(post);
          })
        );
      } catch (e) {
        next(e);
      }
    }

    if (search && !location) {
      try {
        const posts = await PostsService.getSearchPostsByText(
          req.app.get('db'),
          search
        );
        return res.json(
          posts.map(post => {
            post.user_id === req.user.id
              ? (post.userCanEdit = true)
              : (post.userCanEdit = false);
            return PostsService.serializePost(post);
          })
        );
      } catch (e) {
        next(e);
      }
    }

    try {
      const posts = await PostsService.getSearchPosts(
        req.app.get('db'),
        search,
        location
      );
      res.json(
        posts.map(post => {
          post.user_id === req.user.id
            ? (post.userCanEdit = true)
            : (post.userCanEdit = false);
          return PostsService.serializePost(post);
        })
      );
    } catch (e) {
      next(e);
    }
  })
  .post(multerUploads, cloudinaryConfig, async (req, res, next) => {
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
      if (req.file) {
        const file = dataUri(req).content;
        const image = await uploader.upload(file, {
          width: 1024,
          height: 768,
          crop: 'fill'
        });
        const image_url = image.secure_url;
        newPost.image_url = image_url;
      }

      const post = await PostsService.insertPost(req.app.get('db'), newPost);

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${post.id}`))
        .json(PostsService.serializePost(post));
    } catch (e) {
      next(e);
    }
  })
  .patch(multerUploads, cloudinaryConfig, async (req, res, next) => {
    const {
      id,
      title,
      description,
      device,
      condition,
      location,
      previous_image_url
    } = req.body;

    const updatedPost = {
      id,
      title,
      description,
      device,
      condition,
      location
    };
    for (const [key, value] of Object.entries(updatedPost)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    try {
      if (req.file) {
        // Below we get just the public ID of the image off the URL
        // which is required for deletion on cloudinary
        await uploader.destroy(
          previous_image_url.split('/').reverse()[0].split('.')[0]
        );
        const file = dataUri(req).content;
        const image = await uploader.upload(file, {
          width: 1024,
          height: 768,
          crop: 'fill'
        });
        const newImageUrl = image.secure_url;
        updatedPost.image_url = newImageUrl;
      }

      const postToEdit = await PostsService.getById(req.app.get('db'), id);

      if (postToEdit.user_id !== req.user.id) {
        return res
          .status(401)
          .json({ error: `You are not authorized to modify this post` });
      }

      await PostsService.updatePost(req.app.get('db'), id, {
        ...updatedPost,
        date_modified: 'now()'
      });

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

postsRouter
  .route('/:post_id')
  .all(requireAuth)
  .delete(cloudinaryConfig, async (req, res, next) => {
    try {
      const post = await PostsService.getById(
        req.app.get('db'),
        req.params.post_id
      );

      if (post.user_id !== req.user.id) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }

      if (post.image_url) {
        await uploader.destroy(
          post.image_url.split('/').reverse()[0].split('.')[0]
        );
      }
      await PostsService.deletePost(req.app.get('db'), req.params.post_id);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

postsRouter
  .route('/user-posts')
  .all(requireAuth)
  .get(async (req, res, next) => {
    const user_id = req.user.id;

    try {
      const posts = await PostsService.getPostsByUserId(
        req.app.get('db'),
        user_id
      );

      res.json(
        posts.map(post => {
          post.userCanEdit = true;
          return PostsService.serializePost(post);
        })
      );
    } catch (e) {
      next(e);
    }
  });
module.exports = postsRouter;
