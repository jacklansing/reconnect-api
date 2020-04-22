const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('/api/threads endpoints', function () {
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

  describe('POST /api/threads', () => {
    const testUser = testUsers[0];

    it(`responds status 201 when thread successfully created`, () => {
      const newThread = {
        recipient_id: 3
      };

      return supertest(app)
        .post('/api/threads')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .send(newThread)
        .expect(201);
    });
  });

  describe('GET /api/threads', () => {
    const testUser = testUsers[0];

    it(`responds 200 with all threads`, () => {
      return supertest(app)
        .get('/api/threads')
        .set('authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.eql(1);
          expect(res.body[0]).to.have.property('thread_id');
          expect(res.body[0]).to.have.property('author_id');
          expect(res.body[0]).to.have.property('content');
          expect(res.body[0]).to.have.property('date_created');
          expect(res.body[0]).to.have.property('display_name');
        });
    });
  });

  describe('GET /api/threads/:thread_id', () => {
    const testUser = testUsers[0];

    it(`responds 200 with all thread messages`, () => {
      const thread_id = 1;
      return supertest(app)
        .get(`/api/threads/${thread_id}`)
        .set('authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.eql(2);
          expect(res.body[0]).to.have.property('id');
          expect(res.body[0]).to.have.property('thread_id');
          expect(res.body[0]).to.have.property('author_id');
          expect(res.body[0]).to.have.property('display_name');
          expect(res.body[0]).to.have.property('content');
          expect(res.body[0]).to.have.property('date_created');
        });
    });
  });
});
