// backend for simple React authentication app
// Ethan Friedman 2016 https://github.com/ethanjfriedman

// import and set application variables
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './db/db.js';
import mongoose from 'mongoose';
import morgan from 'morgan';
import teachers from './routes/teachers.js'
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';
const mongoURI = process.env.mongoURI || 'mongodb://localhost:27017/react-authentication-backend';
const PORT = process.env.PORT || 3333;
let app = express();

// config
app.server = http.createServer(app);
app.use(morgan('dev')); // event logging
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser);
app.use(expressSession({
  secret: 'Cleo always gets the ball',
  resave: false,
  saveUninitialized: false
  })
);

// set up passport for auth
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy(
  function(username, password, cb) {
    teachers.findOne(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// connect to db and set up routes
db.connect(mongoURI, (err) => {
  if (err) {
    console.error.bind(console, `Error connecting to mongoDB at ${mongoURI}`);
    process.exit(1);
  } else {
    console.log(`connected to mongoDB at ${mongoURI}`);

    //root route
    app.get('/', (req, res) => {
      res.json({
        app:'express authentication backend',
        version:'1.0',
        author: 'Ethan Friedman',
        email: 'ethanjfriedman@gmail.com',
        success: true
      });
    });

    app.use('/teachers', teachers());

    // start server
    app.server.listen(PORT, (err) => {
      if (err) {
        console.error.bind(console, `Error starting up server on ${PORT}`);
        process.exit(1);
      }
    });
    console.log(`Started on port ${app.server.address().port}`);
  }
})

export default app;
