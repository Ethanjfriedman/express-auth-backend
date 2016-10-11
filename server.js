import express from 'express';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import config from './config';
import User from './app/models/user';
import usersController from './users'

// CONFIG //
const PORT = process.env.PORT || 3333;
const app = express();
const secret = config.secret || process.env.REACT_AUTH_SECRET;
const dbURI = process.env.MONGODB_URI || config.database;
const environment = process.env.REACT_AUTH_ENV || "development";

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
if (environment === "development") {
  app.use(morgan('dev'));
}
app.set('superSecret', secret);

// root route
app.get('/', (req, res) => {
  res.json({
    app: 'prospective special needs curriculum backend',
    author: 'ethan friedman',
    github_repo: 'https://github.com/Ethanjfriedman/express-auth-backend',
    version: '1.0',
    location: `http://localhost:${PORT}`
  });
});

// auth routes
app.use('/users', usersController);

// start app
mongoose.connect(dbURI, err => {
  if (err) {
    console.error.bind(console, `error connecting to mongoose at ${dbURI}: ${err}`);
  } else {
    console.log(`Connected to MongoDB at ${dbURI}!`);
    app.listen(PORT, error => {
      if (error) {
        console.error.bind(console, `error starting app listening on port ${PORT}: ${error}`);
        process.exit(1);
      } else {
        console.log(`Server is up and running on port ${PORT}!`);
      }
    });
  }
}); // TODO move app.listen into callback here
