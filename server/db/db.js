import Teacher from './models/Teacher.js';
// import {MongoClient} from 'mongodb';
import mongoose from 'mongoose';

const state = {
  db: null,
};

exports.connect = function(url, done) {
  if (state.db) return done();
  //
  // MongoClient.connect(url, function(err, db) {
  //   if (err) return done(err);
  //   state.db = db
  //   done();
  // })
  const connection = mongoose.connect(url);
  console.log(connection);
  // connection.connect(url);
  // connection.on('error', function() {
  //   return done('error connecting to db via mongoose');
  // });
  // connection.once('open', function() {
  //   state.db = db;
  //   done();
  // });
  done();
};

exports.get = function() {
  return state.db;
};

exports.close = function(done) {
  // if (state.db) {
  //   state.db.close(function(err, result) {
  //     state.db = null;
  //     state.mode = null;
  //     done(err);
  //   })
  // }
  if (state.db) {
    mongoose.disconnect(function(err) {
      state.db = null;
      done(err);
    });
  }
};
