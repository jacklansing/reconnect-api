const UsersService = {
  hasUserWithUsername(db, user_name) {
    return db('reconnect_users')
      .where({ user_name })
      .first()
      .then(user => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('reconnect_users')
      .returning('*')
      .then(([user]) => user);
  }
};

module.exports = UsersService;
