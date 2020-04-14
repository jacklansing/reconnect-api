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
  }
};

module.exports = ThreadsService;
