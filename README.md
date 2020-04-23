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

`Albany, NY`\
`Schenectady, NY`

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

# Express Boilerplate!

This is a boilerplate project used for starting new projects!

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your local machine `git clone BOILERPLATE-URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Move the example Environment file to `.env` that will be ignored by git and read by the express server `mv example.env .env`
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "express-boilerplate",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Run the linter `npm run lint`

Run prettier formatting `npm run format`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
