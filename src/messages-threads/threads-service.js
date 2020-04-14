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
  },
  getLatestThreadMessage(db, id) {
    /* This query retrieves only the very latest message for each
    unique thread or conversation the user has going. This concise
    solution is all thanks to the DISTINCT ON clase in Postgres. */
    return db.raw(
      `SELECT DISTINCT ON (m.thread_id) 
      m.thread_id, m.content, m.author_id, m.date_created
      FROM reconnect_messages m 
      INNER JOIN reconnect_messages_threads t  
      ON m.thread_id = t.id 
      WHERE t.recipient_id = ? OR t.author_id = ? 
      ORDER BY m.thread_id, m.date_created DESC`,
      [id, id]
    );
  }
};

module.exports = ThreadsService;
