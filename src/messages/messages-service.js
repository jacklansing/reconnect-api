const xss = require('xss');

const MessagesService = {
  postNewThead(db, participants) {
    return db('reconnect_messages_threads')
      .insert(participants)
      .returning('*')
      .then(([thread]) => thread)
      .then(thread => MessagesService.getThreadById(db, thread.id));
  },
  getThreadById(db, id) {
    return db('reconnect_messages_threads').where({ id }).first();
  },
  postNewMessage(db, message) {
    return db('reconnect_messages')
      .insert(message)
      .returning('*')
      .then(([message]) => message)
      .then(message => MessagesService.getMessageById(db, message.id));
  },
  getMessageById(db, id) {
    return db('reconnect_messages').where({ id }).first();
  },
  serializeMessage(message) {
    return {
      id: message.id,
      content: xss(message.content),
      thread_id: message.thread_id,
      author_id: message.author_id,
      date_created: message.date_created
    };
  }
};

module.exports = MessagesService;
