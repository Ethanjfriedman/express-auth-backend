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
  On successful user creation, returns a JSON web token that can be used by the frontend when making future requests that require authentication.

POST '/users/login': logs in an existing user

GET '/users/all': authentication required (must have a valid JSON token in either the body, in an 'x-access-token' header, or as a query param): returns a list of all users.

GET '/users/cleo': another test route that requires authentication. Returns a silly message.
