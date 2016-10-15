/*
TODO

This is NOT DRY code. But it works. Things to do:
--move various pieces of functionality to their own functions to dry up the code. e.g.:
  * hashing pws
  * error handling
  * saving user

-- move admin routes to their own router file

*/

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import config from '../../config';
import bcrypt from 'bcrypt';
const secret = config.secret || process.env.REACT_AUTH_SECRET;
const usersController = Router();

// for testing
usersController.get('/', (req, res) => {
  res.json({success: true, error: null, message: 'To log in, go to /users/login'})
});

// create a new user
usersController.post('/new', (req, res) => {
  User.findOne({
    username: req.body.username
  }, (mongooseError, user) => {
    if (mongooseError) {
      res.json({success: false, token: null, error: 'Error searching db.'});
    } else if (user) {
      res.json({success: false, token: null, error: 'Pre-existing user with that username.'});
    } else {
      bcrypt.genSalt(10, (bcryptErr, salt) => {
        if (bcryptErr) {
          console.error.bind(console, `Error in bcrypt: ${bcryptErr}`);
          res.json({success: false, token: null, error: 'server error'});
        } else {
          bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
            if (hashErr) {
              console.error.bind(console, `Error hashing password: ${hashErr}`);
              res.json({success: false, token: null, error: 'server error'});
            } else {
              const newUser = new User({
                username: req.body.username,
                password: hash,
                teacher: req.body.isTeacher,
                admin: req.body.isAdmin //TODO obvs needs work
              });
              newUser.save( saveErr => {
                if (saveErr) {
                  console.error.bind(console, `error saving new user: ${saveErr}`);
                  res.json({success: false, token: null, error: 'server error'});
                } else {
                  // generate token for newly created user
                  const token = jwt.sign(newUser, secret, {
                    expiresIn: 1440 // 24 hours (in minutes)
                  });
                  res.json({success: true, error: null, token});
                }
              });
            }
          });
        }
      });
    }
  });
});

// login in as existing user
usersController.post('/login', (req, res) => {
  const username = req.body.username;
  const pw = req.body.password
  if (!username || !pw) {
    res.json({
      success: false,
      token: null,
      error: "No username and/or password provided."
    });
  } else {
    User.findOne({
      username: username
    }, (userFindError, user) => {
      if (userFindError) {
        console.error.bind(`Error finding user in db: ${userFindError}`);
        res.json({ success: false,
                   token: null,
                   error: `Error finding user in database.`
                 });
      } else if (!user) {
        res.json({ success: false,
                   error: 'Authentication failed. User not found.', token: null
                 });
      } else if (!pw) {
        res.json({ success: false,
                   token: null,
                   error: 'No password provided.'
                 });
      } else {
        bcrypt.compare(pw, user.password, (compareError, result) => {
          if (compareError) {
            console.error.bind(console, `error comparing passwords with bcrypt: ${compareError}`);
            res.json({ success: false,
                       token: null,
                       error: "Password error."
                     });
          } else {
            if (result) {
              const token = jwt.sign(user, secret, {
                expiresIn: 1440 // 24 hours (in minutes)
              });
              res.json({
                success: true,
                error: null,
                token
              });
            } else {
              res.json({
                success: false,
                error: "Wrong password entered.",
                token: null
              });
            }
          }
        });
      }
    });
  }
});

// MIDDLEWARE TO CHECK FOR VALID AUTHENTICATION ON ALL OTHER ROUTES
usersController.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, secret, (err, confirmation) => {
      if (err) {
        res.json({ success: false, error: 'Failed to authenticate token.' });
      } else {
        req.confirmation = confirmation;
        req.username = confirmation._doc.username;
        req.isAdmin = confirmation._doc.admin;
        req.isTeacher = confirmation._doc.teacher;
        next();
      }
    });
  } else {
    res.status(403).send({
      success: false,
      error: 'No token provided.'
    });
  }
});

usersController.get('/cleo', (req, res) => {
  res.json({sucess: true, message: 'you should not be able to see this unless you passed a valid token to the backend. Also Cleo is the BEST DOG.'});
});

// middleware to require administrator privileges for all routes below this
usersController.use((req, res, next) => {
  if (req.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Admin privileges required.'
    });
  }
});

// view all users
usersController.get('/all', (req, res) => {
    User.find({}, (error, users) => {
      if (error) {
        console.error.bind(console, `Error finding users in db: ${error}`);
        res.json({success: false, error, users: null});
      } else {
        res.json({success: true, error: null, users});
      }
    });
});

// view one user
usersController.get('/:id', (req, res) => {
    const username = req.params.id;
    User.findOne({ username }, (dbErr, user) => {
      if (dbErr) {
        console.error.bind(console, `error looking user up in db: ${dbErr}`);
        res.json({
          success: false,
          error: "Database error",
          user: null
        });
      } else {
        res.json({ success: true, error: null, user});
      }
    });
});

// update user
usersController.put('/:id', (req, res) => {
    const username = req.params.id;
    User.findOne({ username }, (dbErr, user) => {
      if (dbErr) {
        console.error.bind(console, `error looking user up in db: ${dbErr}`);
        res.json({
          success: false,
          error: "Database error",
          user: null
        });
      } else {
        const oldUser = Object.assign({}, user);
        user.username = req.body.username || user.username;
        user.teacher = req.body.isTeacher || user.teacher;
        // only way to change admin status should be manually on the db:
        user.admin = user.admin;
        console.log(`uid: ${user.username}, pw: ${user.password}`);
        if (req.body.password) {
          bcrypt.genSalt(10, (saltErr, salt) => {
            if (saltErr) {
              console.error.bind(console, `error generating salt: ${saltErr}`);
              res.json({success: false, error: saltErr});
            } else {
              bcrypt.hash(req.body.password, salt, (hashErr, hash) => {
                if (hashErr) {
                  console.error.bind(console, `error hashing plaintext: ${hashErr}`);
                  res.json({ success: false, error: hashErr });
                } else {
                  user.save((saveErr, result) => {
                    if (saveErr) {
                      console.error.bind(console, `error saving to db: ${saveErr}`);
                      res.json({
                        success: false,
                        error: saveErr,
                        user: oldUser
                      });
                    } else {
                      res.json({
                        success: true,
                        error: null,
                        user: result
                      });
                    }
                  });
                }
              });
            }
          });
        } else {
          user.save((saveErr, result) => {
            if (saveErr) {
              console.error.bind(console, `error saving to db: ${saveErr}`);
              res.json({
                success: false,
                error: saveErr,
                user: oldUser
              });
            } else {
              res.json({
                success: true,
                error: null,
                user: result
              });
            }
          });        }
      }
    });
});

// delete user
usersController.delete('/:id', (req, res) => {
    const username = req.params.id;
    User.findOneAndRemove({ username }, (dbErr, result) => {
      if (dbErr) {
        console.error.bind(console, `error looking user up in db: ${dbErr}`);
        res.json({
          success: false,
          error: "Database error"
        });
      } else {
        res.json({
          success: true,
          error: null
        });
      }
    });
});

//TODO
// delete route (admin OR that user only) to delete a user
// (DELETE to /users/delete ? how RESTful do I feel like being)
// edit route to edit a user (PUT to /users/edit)

export default usersController;
