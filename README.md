# Re-Connect Server

## Getting set up

- Install dependencies: `npm install`
- Create dev and test databases: `createdb reconnect`, `createdb reconnect-test`
- Create database user: `createuser reconnect`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE reconnect TO reconnect`
  - `GRANT ALL PRIVILEGES ON DATABASE reconnect-test TO reconnect`
- Prepare env file: `cp example.env .env`
- Replace values in `.env` with your custom values.
- Bootstrap dev database: `npm run migrate`
- Bootstrap test database: `npm run migrate:test`

For tests involving time to run properly, make sure your Postgres database is configured to run in the UTC timezone.

To seed the development database run: `psql -U reconnect -d reconnect -a -f seeds/seed.reconnect_tables.sql`

To clear seed data run: `psql -U reconnect -d reconnect -a -f seeds/trunc.reconnect_tables.sql`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run the linter `npm run lint`

Run prettier formatting `npm run format`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.

## API Info

### POST /api/users

Use this route to register a new user account. Upon successful registration an authToken is sent back so that the user may begin using the app immediately.

Example request:

```
{
	"user_name": "username",
	"password": "Password123!",
	"display_name": "John Smith",
	"user_type": "Donor"
}
```

Example response:

```
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJpYXQiOjE1ODc2NzcyNjksInN1YiI6InVzZXJuYW1lIn0.LASOEdtOdxjdaK_Y7wwJHMHBwbI_AeOnAHwjUb5VmuU"
}
```

### POST /api/auth/login

Use this route to request a JWT authentication token. This authentication token must be presented at most other routes in the applicaiton.

Example request:

```
{
	"user_name": "username",
	"password": "Password123!"
}
```

Example response:

```
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJpYXQiOjE1ODc2NzczMzEsInN1YiI6InVzZXJuYW1lIn0.UdG-a1QLGoNUtdEspCME06hIBZraent0pz31kNttkCU"
}
```

If the username or password does not match one in the database, you will receive an error:

```
{
  "error": "Incorrect username or password"
}
```

### GET /api/posts?search={search}&location={location}

By default this route will return all posts. Optional query parameters include search text to search the `title` and `description` fields, as well as `location`.

`location` must match one of the valid location categories specified in the database. By default these are:

- `Albany, NY`
- `Schenectady, NY`

Example resposne:

```
[
  {
    "id": 32,
    "title": "iPhone 6",
    "description": "Old iPhone 6. Still works!",
    "post_author": "Jean-Luc Picard",
    "device": "iPhone",
    "condition": "good",
    "location": "Albany, NY",
    "date_created": "2020-04-22T01:26:52.847Z",
    "user_id": 4,
    "userCanEdit": false
  },
  {
    "id": 27,
    "title": "Old Galaxy s8",
    "description": "Still a great phone. Happy to offer it up!",
    "post_author": "William Riker",
    "device": "Android",
    "condition": "very good",
    "location": "Schenectady, NY",
    "date_created": "2020-04-21T01:16:27.755Z",
    "user_id": 4,
    "userCanEdit": false
  }
]
```

### GET /api/posts/user-posts

Will retrieve only the posts created by the currently authenticated user. If no posts are found, the response will be an empty array.

Example response:

```
[
  {
    "id": 41,
    "title": "Galaxy s8",
    "description": "My wife has upgraded her Galaxy s8 and no longer needs it. Still a great phone. Hit me up! ",
    "device": "Android",
    "condition": "very good",
    "location": "Albany, NY",
    "date_created": "2020-04-23T18:04:29.100Z",
    "user_id": 40,
    "userCanEdit": true
  },
  {
    "id": 40,
    "title": "iPhone 7",
    "description": "Hey there. I have an old iPhone 7 I don't use anymore. I'd be happy to give it to anyone that's interested in using it. The battery life is still pretty good and the phone itself is in good shape.",
    "device": "iPhone",
    "condition": "good",
    "location": "Albany, NY",
    "date_created": "2020-04-23T18:03:12.258Z",
    "user_id": 40,
    "userCanEdit": true
  }
]
```

### POST /api/posts

Creates a new post. All fields are required, but for the `condition`, `device`, and `location` fields you can provide sensible defaults as there are only certain valid choices. Response includes the newly created post with additional info.

For `condition` :

- `very good`
- `good`
- `okay`
- `damaged`

For `device` :

- `Android`
- `iPhone`
- `Windows`
- `Macbook`

For `location` :

- `Albany, NY`
- `Schenectady, NY`

Example request:

```
{
	"title": "iPhone 5",
	"description": "Found this in my desk. Yours if you want it",
	"device": "iPhone",
	"condition": "okay",
	"location": "Albany, NY"
}
```

Example response:

```
{
  "id": 36,
  "title": "iPhone 5",
  "description": "Found this in my desk. Yours if you want it",
  "device": "iPhone",
  "condition": "okay",
  "location": "Albany, NY",
  "date_created": "2020-04-23T23:52:21.740Z",
  "user_id": 8
}
```

### PATCH /api/posts

Used to update existing posts. Requires the same information as creating a new post, but also requires the `id` of the post to be included. If the authenticated user does not match the `user_id` field of the post, you will receive an error: `401 'You are not authorized to modify this post'`

On success you will receive a `204 No Content` response.

Example request:

```
{   "id": 36,
	"title": "iPhone 5",
	"description": "Update: found this in my HOME desk. Yours if you want it",
	"device": "iPhone",
	"condition": "okay",
	"location": "Albany, NY"
}
```

### DELETE /api/post/{post_id}

Used to delete a post by it's `id`. If the authenticated user's `id` does not match the post's `user_id` it will result in an error: `401 Unauthorized request`

On success you will get a `204 No Content` response.

### POST /api/threads

Starts a new message thread with the user. Must provide the `id` of another valid user as the `recipient_id`.

Example request:

```
{
    "recipient_id": 2
}
```

Example response:

```
{
  "id": 60,
  "author_id": 8,
  "recipient_id": 2,
  "date_created": "2020-04-24T00:17:20.310Z"
}
```

### GET /api/threads

Respond with a list of each unique message thread the currently authenticated user has, along with the most recent message between those two users.

Responds with an empty array if none are found.

Example response:

```
[
  {
    "thread_id": 44,
    "content": "Hey Jim, is this Macbook still available? It would be really helpful. Thanks! ",
    "author_id": 40,
    "date_created": "2020-04-23T19:26:32.075Z",
    "display_name": "Jim B."
  },
  {
    "thread_id": 43,
    "content": "Hi Robert, is this iPhone 7 still available?",
    "author_id": 44,
    "date_created": "2020-04-23T19:25:15.698Z",
    "display_name": "Zach H."
  },
  {
    "thread_id": 41,
    "content": "Yes! That would be awesome. What day(s) and time(s) would work well for you?",
    "author_id": 41,
    "date_created": "2020-04-23T18:15:51.626Z",
    "display_name": "Sally M."
  }
]
```

### GET /api/threads/{thread_id}

Responds with all the messages for the specific thread with `id` of `thread_id`.

Example response:

```
[
  {
    "id": 65,
    "content": "Yes! That would be awesome. What day(s) and time(s) would work well for you?",
    "thread_id": 41,
    "author_id": 41,
    "date_created": "2020-04-23T18:15:51.626Z",
    "display_name": "Sally M."
  },
  {
    "id": 64,
    "content": "It is! Do you live in the area? I'm happy to meet at the Starbucks near the hospital.",
    "thread_id": 41,
    "author_id": 40,
    "date_created": "2020-04-23T18:15:04.902Z",
    "display_name": "Robert T."
  },
  {
    "id": 63,
    "content": "Hi Robert,\n\nI'm interested in the iPhone you posted here. Is it still available?",
    "thread_id": 41,
    "author_id": 41,
    "date_created": "2020-04-23T18:13:59.184Z",
    "display_name": "Sally M."
  }
]
```

### POST /api/messages

Creates a new message for an existing thread. Must provide a valid `id` from a thread as `thread_id`.

On success the server will respond with the created message.

Example request:

```
{
	"thread_id": 43,
	"content": "Sorry, unfortunately it is no longer available. I will delete the post."
}
```

Example response:

```
{
  "id": 69,
  "content": "Sorry, unfortunately it is no longer available. I will delete the post.",
  "thread_id": 43,
  "author_id": 40,
  "date_created": "2020-04-24T00:27:05.232Z",
  "display_name": "Robert T."
}
```
