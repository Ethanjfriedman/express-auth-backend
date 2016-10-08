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
const mongoURI = process.env.mongoURI || 'mongodb://localhost:27017/react-authentication-backend';
const PORT = process.env.PORT || 3333;
let app = express();

// config
app.server = http.createServer(app);
app.use(morgan('dev')); // event logging
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// connect to db and set up routes
db.connect(mongoURI, (err) => {
  if (err) {
    console.log(`Error connecting to mongoDB at ${mongoURI}`);
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
        console.log(`Error starting up server on ${PORT}`);
        process.exit(1);
      }
    });
    console.log(`Started on port ${app.server.address().port}`);
  }
})

export default app;
