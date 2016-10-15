# Sample authentication backend

Stack:
  * Node
  * Express
  * JSONWebTokens
  * MongoDB

Deployed at []().

This is an API server: sends JSON only.

ROUTES:

GET '/': returns info about the app
GET '/users': just returns a JSON message. to be deleted.
POST '/users/new': creates a new user. Expects the body of the request to contain:
  - username (string)
  - password (string)
  - isTeacher (boolean)
  - isAdmin (boolean)

  On successful user creation, returns a JSON web token that can be used by the frontend when making future requests that require  authentication.

POST '/users/login': logs in an existing user


GET '/users/cleo': a test route that requires authentication. Returns a silly message if a valid token is passed

GET '/users/all': authentication required (must have a valid JSON token in either the body, in an 'x-access-token' header, or as a query param): returns a list of all users. In addition, the token must be one associated with a user who has admin privileges only.

GET '/users/:id': returns a single user as specified by the id param. A valid administrator token required.

PUT '/users/update': updates a user. Expects the body of the request to contain the following:
  - username (string): the existing username to look up (required)
  - newUsername (string, OPTIONAL): the new username
  - password (string, OPTIONAL): new password
  - teacher (boolean, OPTIONAL): new status of whether or not user account is a teacher account or not

Note that you cannot change whether or not a user account is an administrator account or not -- that can only be done at the moment by manually accessing the database.

DELETE '/users/:id': deletes the user specified by the id param. 
