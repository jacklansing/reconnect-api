const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('/api/users endpoints', function () {
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

  describe('POST /api/users', () => {
    it(`creates new user when user and pass valid and sends authToken back`, () => {
      const newValidUser = {
        user_name: 'new-test-user',
        display_name: 'new test user',
        password: 'Password123!',
        user_type: 'Donor'
      };

      return supertest(app)
        .post('/api/users')
        .send(newValidUser)
        .expect(201)
        .expect(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('authToken');
        });
    });

    it(`responds status 400 Username already taken when user already in db`, () => {
      const newInvalidUser = {
        user_name: testUsers[0].user_name,
        display_name: 'new test user',
        password: 'Password123!',
        user_type: 'Donor'
      };
      return supertest(app)
        .post('/api/users')
        .send(newInvalidUser)
        .expect(400, { error: `Username already taken` });
    });

    it(`responds status 400 and an error if password is too weak`, () => {
      const newInvalidUser = {
        user_name: 'new-test-user',
        display_name: 'new test user',
        password: 'weakpassword',
        user_type: 'Donor'
      };
      return supertest(app).post('/api/users').send(newInvalidUser).expect(400);
    });

    ['user_name', 'display_name', 'password', 'user_type'].forEach(field => {
      it(`respond with 400 Missing ${field} in request body when field missing`, () => {
        const newInvalidUser = {
          user_name: 'new-test-user',
          display_name: 'new test user',
          password: 'Password123!',
          user_type: 'Donor'
        };

        delete newInvalidUser[field];
        return supertest(app)
          .post('/api/users')
          .send(newInvalidUser)
          .expect(400, { error: `Missing '${field}' in request body` });
      });
    });
  });
});
