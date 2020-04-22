const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password',
      display_name: 'test user 1',
      user_type: 'Donor'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password',
      display_name: 'test user 2',
      user_type: 'Seeking'
    },
    {
      id: 3,
      user_name: 'test-user-3',
      password: 'password',
      display_name: 'test user 3',
      user_type: 'Donor'
    },
    {
      id: 4,
      user_name: 'test-user-4',
      password: 'password',
      display_name: 'test user 4',
      user_type: 'Seeking'
    }
  ];
}

function makePostsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      title: 'New Test Post 1',
      description: 'Some device description test.',
      device: 'Android',
      condition: 'very good',
      location: 'Albany, NY',
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 2,
      user_id: users[1].id,
      title: 'New Test Post 2',
      description: 'Some device description test.',
      device: 'iPhone',
      condition: 'good',
      location: 'Albany, NY',
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 3,
      user_id: users[2].id,
      title: 'New Test Post 3',
      description: 'Some device description test.',
      device: 'Windows',
      condition: 'okay',
      location: 'Schenectady, NY',
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 4,
      user_id: users[3].id,
      title: 'New Test Post 4',
      description: 'Some device description test.',
      device: 'Macbook',
      condition: 'damaged',
      location: 'Schenectady, NY',
      date_created: '2020-04-21T16:28:32.615Z'
    }
  ];
}

function makeThreadsArray(users) {
  return [
    {
      id: 1,
      recipient_id: users[0].id,
      author_id: users[1].id,
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 2,
      recipient_id: users[1].id,
      author_id: users[2].id,
      date_created: '2020-04-21T16:28:32.615Z'
    }
  ];
}

function makeMessagesArray(threads) {
  return [
    {
      id: 1,
      content: 'Message content 1',
      thread_id: threads[0].id,
      author_id: threads[0].author_id,
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 2,
      content: 'Message content 2',
      thread_id: threads[0].id,
      author_id: threads[0].recipient_id,
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 3,
      content: 'Message content 3',
      thread_id: threads[1].id,
      author_id: threads[1].author_id,
      date_created: '2020-04-21T16:28:32.615Z'
    },
    {
      id: 4,
      content: 'Message content 4',
      thread_id: threads[1].id,
      author_id: threads[1].recipient_id,
      date_created: '2020-04-21T16:28:32.615Z'
    }
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      reconnect_messages,
      reconnect_messages_threads,
      reconnect_posts,
      reconnect_users
      RESTART IDENTITY CASCADE`
  );
}

function seedUsersTable(db, users) {
  const usersHashedPass = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into('reconnect_users')
    .insert(usersHashedPass)
    .then(() =>
      db.raw(
        `
  SELECT setval('reconnect_users_id_seq', ?)`,
        [users[users.length - 1].id]
      )
    );
}

function seedPostsAndMessages(
  db,
  users,
  posts = [],
  threads = [],
  messages = []
) {
  return db.transaction(async trx => {
    await seedUsersTable(trx, users);

    if (posts.length) {
      await trx.into('reconnect_posts').insert(posts);
      await trx.raw(`SELECT setval('reconnect_posts_id_seq', ?)`, [
        posts[posts.length - 1].id
      ]);
    }

    if (threads.length && messages.length) {
      await trx.into('reconnect_messages_threads').insert(threads);
      await trx.raw(`SELECT setval('reconnect_messages_threads_id_seq', ?)`, [
        posts[posts.length - 1].id
      ]);

      await trx.into('reconnect_messages').insert(messages);
      await trx.raw(`SELECT setval('reconnect_messages_id_seq', ?)`, [
        messages[messages.length - 1].id
      ]);
    }
  });
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testPosts = makePostsArray(testUsers);
  const testThreads = makeThreadsArray(testUsers);
  const testMessages = makeMessagesArray(testThreads);

  return { testUsers, testPosts, testThreads, testMessages };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256'
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makePostsArray,
  makeThreadsArray,
  makeMessagesArray,
  makeFixtures,
  makeAuthHeader,
  cleanTables,
  seedPostsAndMessages
};
