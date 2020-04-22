const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('/api/posts endpoints', function () {
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

  describe('GET /api/posts', () => {
    context(`Given there are No Posts in the database`, () => {
      beforeEach('insert data', () =>
        helpers.seedPostsAndMessages(db, testUsers)
      );
      it(`'responds 200 with an empty posts array`, () => {
        return supertest(app)
          .get('/api/posts')
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context(`Given there are Posts in the database`, () => {
      beforeEach('insert data', () =>
        helpers.seedPostsAndMessages(
          db,
          testUsers,
          testPosts,
          testThreads,
          testMessages
        )
      );

      it(`responds 200 with an array of posts`, () => {
        const testUser = testUsers[0];
        const expectedPosts = testPosts.map(post =>
          helpers.makeExpectedPost(testUser, testUsers, post)
        );

        return supertest(app)
          .get('/api/posts')
          .set('authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedPosts);
      });

      it(`responds with only the expected posts when search param`, () => {
        const searchParam = 'test post 1';

        return supertest(app)
          .get(`/api/posts?search=${searchParam}`)
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(1);
            expect(res.body[0].title).to.eql('New Test Post 1');
          });
      });

      it(`responds with only the expected posts when location param`, () => {
        const locationParam = 'Albany, NY';

        return supertest(app)
          .get(`/api/posts?location=${locationParam}`)
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(2);
            expect(res.body[0].location).to.eql(locationParam);
            expect(res.body[1].location).to.eql(locationParam);
          });
      });

      it(`responds with only the expected post when search and location params`, () => {
        const searchParam = 'test';
        const locationParam = 'Albany, NY';

        return supertest(app)
          .get(`/api/posts?search=${searchParam}&location=${locationParam}`)
          .set('authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.eql(2);
            expect(res.body[0].title.toLowerCase()).to.include(
              searchParam.toLowerCase()
            );
            expect(res.body[0].location).to.eql(locationParam);
            expect(res.body[1].title.toLowerCase()).to.include(
              searchParam.toLowerCase()
            );
            expect(res.body[1].location).to.eql(locationParam);
          });
      });
    });
  });

  describe('POST /api/posts', () => {
    beforeEach('insert data', () =>
      helpers.seedPostsAndMessages(
        db,
        testUsers,
        testPosts,
        testThreads,
        testMessages
      )
    );

    it(`responds 201 with post when valid post`, () => {
      this.retries(3);
      const validPost = {
        title: 'New Test Post 1',
        description: 'Some device description test.',
        device: 'Android',
        condition: 'very good',
        location: 'Albany, NY'
      };

      return supertest(app)
        .post('/api/posts')
        .set('authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(validPost)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.title).to.eql(validPost.title);
          expect(res.body.description).to.eql(validPost.description);
          expect(res.body.device).to.eql(validPost.device);
          expect(res.body.condition).to.eql(validPost.condition);
          expect(res.body.location).to.eql(validPost.location);
          expect(res.body.user_id).to.eql(testUsers[0].id);
          expect(res.headers.location).to.eql(`/api/posts/${res.body.id}`);
          const expectedDate = new Date().toLocaleString('en');
          const actualDate = new Date(res.body.date_created).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
        })
        .expect(res =>
          db
            .from('reconnect_posts')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.title).to.eql(validPost.title);
              expect(row.description).to.eql(validPost.description);
              expect(row.device).to.eql(validPost.device);
              expect(row.condition).to.eql(validPost.condition);
              expect(row.location).to.eql(validPost.location);
              expect(row.user_id).to.eql(testUsers[0].id);
              const expectedDate = new Date().toLocaleString('en');
              const actualDate = new Date(row.date_created).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
        );
    });
  });

  describe('PATCH /api/posts', () => {
    beforeEach('insert data', () =>
      helpers.seedPostsAndMessages(
        db,
        testUsers,
        testPosts,
        testThreads,
        testMessages
      )
    );

    it(`responds 204 with successful post update`, () => {
      const updatedPost = {
        id: 1,
        title: 'Updated post title',
        description: 'Updated post descrtipion',
        device: 'Macbook',
        condition: 'damaged',
        location: 'Schenectady, NY'
      };

      return supertest(app)
        .patch('/api/posts')
        .set('authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(updatedPost)
        .expect(204);
    });
  });

  describe('DELETE /api/posts/:post_id', () => {
    beforeEach('insert data', () =>
      helpers.seedPostsAndMessages(
        db,
        testUsers,
        testPosts,
        testThreads,
        testMessages
      )
    );

    it(`responds 204 when post successfully deleted`, () => {
      const postToDelete = testPosts[0];
      const postAuthor = testUsers.find(
        user => user.id === postToDelete.user_id
      );
      return supertest(app)
        .delete(`/api/posts/${postToDelete.id}`)
        .set('authorization', helpers.makeAuthHeader(postAuthor))
        .expect(204);
    });

    it(`responds '401 Unauthorized request' when post does not belong to user`, () => {
      // Requires the first post in fixtures to have an author (user_id)
      // different from the one specified below.
      const postToDelete = testPosts[0];
      const invalidPostAuthor = testUsers[3];

      return supertest(app)
        .delete(`/api/posts/${postToDelete.id}`)
        .set('authorization', helpers.makeAuthHeader(invalidPostAuthor))
        .expect(401, { error: 'Unauthorized request' });
    });
  });

  describe('GET /api/posts/user-posts', () => {
    context(`Given the user in question has posts`, () => {
      beforeEach('insert data', () =>
        helpers.seedPostsAndMessages(
          db,
          testUsers,
          testPosts,
          testThreads,
          testMessages
        )
      );

      it(`responds with a list of only the users posts`, () => {
        const testUser = testUsers[0];
        const expectedPosts = testPosts
          .map(post => helpers.makeExpectedPost(testUser, testUsers, post))
          .filter(post => post.user_id === testUser.id);

        // On this response we do not give back a post author, since
        // it should only show posts matching that user_id anyway.
        const userPosts = expectedPosts.map(post => ({
          ...post,
          post_author: ''
        }));

        return supertest(app)
          .get('/api/posts/user-posts')
          .set('authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body).to.be.an('array');
            expect(res.body).to.eql(userPosts);
          });
      });
    });
  });
});
