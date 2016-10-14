import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from './app/models/user';
import config from './config';
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
                  console.log('token',token);
                  res.json({success: true, error: null, token});
                }
              }); // end User.save
            }
          }); // end bcrypt.hash
        }
      }); // end bcrypt.genSalt
    }
  }); // end User.findOne
}); //end route

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

usersController.use((req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, secret, (err, confirmation) => {
      if (err) {
        res.json({ success: false, error: 'Failed to authenticate token.' });
      } else {
        req.confirmation = confirmation;
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

// TODO should only be available for admin users
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

usersController.get('/cleo', (req, res) => {
  res.json({sucess: true, message: 'you should not be able to see this unless you passed a valid token to the backend.'})
});
//TODO
// delete route (admin OR that user only) to delete a user
// (DELETE to /users/delete ? how RESTful do I feel like being)
// edit route to edit a user (PUT to /users/edit)

export default usersController;
