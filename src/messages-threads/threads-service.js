const ThreadsService = {
  postNewThead(db, participants) {
    return db('reconnect_messages_threads')
      .insert(participants)
      .returning('*')
      .then(([thread]) => thread)
      .then(thread => ThreadsService.getThreadById(db, thread.id));
  },
  getThreadById(db, id) {
    return db('reconnect_messages_threads').where({ id }).first();
  },
  getThreadsByUser(db, id) {
    return db('reconnect_messages_threads')
      .where({ author_id: id })
      .orWhere({ recipient_id: id });
    // .orderBy('date_created', 'asc');
  }
};

module.exports = ThreadsService;
