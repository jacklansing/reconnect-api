const xss = require('xss');

const PostsService = {
  getAllPosts(db) {
    return db('reconnect_posts').select('*');
  },
  getById(db, id) {
    return db('reconnect_posts').where({ id }).first();
  },
  insertPost(db, newPost) {
    return db('reconnect_posts')
      .insert(newPost)
      .returning('*')
      .then(([post]) => post)
      .then(post => PostsService.getById(db, post.id));
  },
  serializePost(post) {
    return {
      id: post.id,
      title: xss(post.title),
      description: xss(post.description),
      device: post.device,
      condition: post.condition,
      location: post.location,
      date_created: post.date_created,
      user_id: post.user_id
    };
  },
  getSearchPosts(db, searchText, location) {
    let queryBuilder = db('reconnect_posts');
    if (location) {
      queryBuilder.where({ location });
    }
    return queryBuilder
      .where('title', 'ilike', `%${searchText}%`)
      .orWhere('description', 'ilike', `%${searchText}%`);
  }
};

module.exports = PostsService;
