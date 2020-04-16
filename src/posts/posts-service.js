const xss = require('xss');

const PostsService = {
  getAllPosts(db) {
    return db
      .raw(
        `SELECT 
          rp.id, rp.title, 
          rp.description, 
          rp.device, 
          rp.condition, 
          rp.location, 
          rp.date_created, 
          rp.date_modified, 
          ru.display_name as post_author
        FROM reconnect_posts rp 
        INNER JOIN reconnect_users ru ON rp.user_id = ru.id;`
      )
      .then(result => result.rows);
  },
  getById(db, id) {
    return db('reconnect_posts').where({ id }).first();
  },
  getPostsByUserId(db, user_id) {
    return db('reconnect_posts')
      .where({ user_id })
      .orderBy('date_modified', 'desc');
  },
  insertPost(db, newPost) {
    return db('reconnect_posts')
      .insert(newPost)
      .returning('*')
      .then(([post]) => post)
      .then(post => PostsService.getById(db, post.id));
  },
  updatePost(db, id, updatedPost) {
    return db('reconnect_posts')
      .where({ id })
      .update(updatedPost)
      .then(rowsAffected => rowsAffected[0]);
  },
  serializePost(post) {
    return {
      id: post.id,
      title: xss(post.title),
      description: xss(post.description),
      post_author: xss(post.post_author),
      device: post.device,
      condition: post.condition,
      location: post.location,
      date_created: post.date_created,
      user_id: post.user_id,
      userCanEdit: post.userCanEdit
    };
  },
  getSearchPosts(db, searchText, location) {
    searchText = `%${searchText}%`;
    return db
      .raw(
        `SELECT 
          rp.id, 
          rp.title, 
          rp.description, 
          rp.device, 
          rp.condition, 
          rp.location, 
          rp.date_created, 
          rp.date_modified, 
          ru.display_name as post_author
        FROM reconnect_posts rp 
        INNER JOIN reconnect_users ru ON rp.user_id = ru.id
        WHERE (rp.title ILIKE ? OR rp.description ILIKE ?)
        AND rp.location = ?`,
        [searchText, searchText, location]
      )
      .then(result => result.rows);
  },
  getSearchPostsByLocation(db, location) {
    return db
      .raw(
        `SELECT 
        rp.id, 
        rp.title, 
        rp.description, 
        rp.device, 
        rp.condition, 
        rp.location, 
        rp.date_created, 
        rp.date_modified, 
        ru.display_name as post_author
      FROM reconnect_posts rp 
      INNER JOIN reconnect_users ru ON rp.user_id = ru.id
      WHERE rp.location = ?`,
        location
      )
      .then(result => result.rows);
  },
  getSearchPostsByText(db, searchText) {
    searchText = `%${searchText}%`;
    return db
      .raw(
        `SELECT 
        rp.id, 
        rp.title, 
        rp.description, 
        rp.device, 
        rp.condition, 
        rp.location, 
        rp.date_created, 
        rp.date_modified, 
        ru.display_name as post_author
      FROM reconnect_posts rp 
      INNER JOIN reconnect_users ru ON rp.user_id = ru.id
      WHERE rp.title ILIKE ? OR rp.description ILIKE ?`,
        [searchText, searchText]
      )
      .then(result => result.rows);
  }
};

module.exports = PostsService;
