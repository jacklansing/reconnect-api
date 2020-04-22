const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected endpoints', () => {
  let db;

  const {
    testUsers,
    testPosts,
    testThreads,
    testMessages
  } = helpers.makeFixtures();

  before('make a knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach('insert data', () =>
    helpers.seedPostsAndMessages(
      db,
      testUsers,
      testPosts,
      testThreads,
      testMessages
    )
  );

  const protectedEndpoints = [
    {
      name: 'GET /api/posts',
      path: '/api/posts',
      method: supertest(app).get
    },
    {
      name: 'GET /api/posts/user-posts',
      path: '/api/posts/user-posts',
      method: supertest(app).get
    },
    {
      name: 'POST /api/posts',
      path: '/api/posts',
      method: supertest(app).post
    },
    {
      name: 'PATCH /api/posts',
      path: '/api/posts',
      method: supertest(app).patch
    },
    {
      name: 'DELETE /api/posts/:post_id',
      path: '/api/posts/1',
      method: supertest(app).delete
    },
    {
      name: 'POST /api/messages',
      path: '/api/messages',
      method: supertest(app).post
    },
    {
      name: 'POST /api/threads',
      path: '/api/threads',
      method: supertest(app).post
    },
    {
      name: 'GET /api/threads/:thread_id',
      path: '/api/threads/1',
      method: supertest(app).get
    }
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });
      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return endpoint
          .method(endpoint.path)
          .set(
            'Authorization',
            helpers.makeAuthHeader(validUser, invalidSecret)
          )
          .expect(401, { error: 'Unauthorized request' });
      });
      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { user_name: 'not-a-user', id: 1 };
        return endpoint
          .method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: 'Unauthorized request' });
      });
    });
  });
});
