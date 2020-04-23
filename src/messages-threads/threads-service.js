const xss = require('xss');

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
    unique thread or conversation the user has going. This
    solution is thanks to the DISTINCT ON clause in Postgres. */
    return db
      .raw(
        `
        SELECT * FROM (
          SELECT DISTINCT ON (m.thread_id) 
          m.thread_id, m.content, m.author_id, m.date_created, u.display_name
          FROM reconnect_messages m INNER JOIN reconnect_messages_threads t  
          ON m.thread_id = t.id 
          INNER JOIN reconnect_users u ON (CASE WHEN t.recipient_id = ? THEN t.author_id = u.id ELSE t.recipient_id = u.id END)
          WHERE t.recipient_id = ? OR t.author_id = ? 
          ORDER BY m.thread_id, m.date_created DESC
        ) t ORDER BY date_created DESC;
      `,
        [id, id, id]
      )
      .then(result => result.rows);
  },
  getAllThreadMessages(db, id) {
    return db
      .raw(
        `
    SELECT m.id, m.content, m.thread_id, m.author_id, m.date_created, u.display_name
    FROM reconnect_messages m INNER JOIN reconnect_users u
    ON m.author_id = u.id
    WHERE m.thread_id = ?
    ORDER BY m.date_created DESC;
    `,
        [id]
      )
      .then(result => result.rows);
  },
  serializeThread(thread) {
    return {
      thread_id: thread.thread_id,
      content: xss(thread.content),
      author_id: thread.author_id,
      date_created: thread.date_created,
      display_name: xss(thread.display_name)
    };
  },
  serializeThreadMesssages(message) {
    return {
      id: message.id,
      content: xss(message.content),
      thread_id: message.thread_id,
      author_id: message.author_id,
      date_created: message.date_created,
      display_name: xss(message.display_name)
    };
  }
};

module.exports = ThreadsService;
