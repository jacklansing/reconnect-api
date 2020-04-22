const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('/api/messages endpoints', function () {
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

  describe('POST /api/messages', () => {
    const validMessage = {
      content: 'New message content',
      thread_id: testThreads[0].id
    };

    const testUser = testUsers[0];

    it(`responds 201 with message when valid message`, () => {
      return supertest(app)
        .post('/api/messages')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .send(validMessage)
        .expect(201)
        .expect(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.content).to.eql(validMessage.content);
          expect(res.body.thread_id).to.eql(validMessage.thread_id);
          expect(res.body).to.have.property('author_id');
          expect(res.body).to.have.property('date_created');
          expect(res.body).to.have.property('display_name');
          expect(res.body).to.have.property('id');
        });
    });

    it(`responds 400 Missing 'content' in request body when missing content field`, () => {
      const invalidMessage = {
        thread_id: 1
      };
      return supertest(app)
        .post('/api/messages')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .send(invalidMessage)
        .expect(400, { error: `Missing 'content' in request body` });
    });
    it(`responds 400 Missing 'thread_id' in request body when missing thread_id field`, () => {
      const invalidMessage = {
        content: 'New message'
      };
      return supertest(app)
        .post('/api/messages')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .send(invalidMessage)
        .expect(400, { error: `Missing 'thread_id' in request body` });
    });
  });
});
