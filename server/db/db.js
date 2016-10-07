import Teacher from './models/Teacher.js';
import mongoose from 'mongoose';

const state = {
  db: null,
};

exports.connect = function(url, done) {
  if (state.db) return done();

  mongoose.connect(url);
  const database = mongoose.connection;
  database.on('error', function() {
    return done('error connecting to db via mongoose');
  });
  database.once('open', function() {
    const teacherModel = mongoose.model('teacher', Teacher);
    const testTeacher = new teacherModel({username: 'test', password: 'test'});
    state.db = database;
    done();
  });
};

exports.get = function() {
  return state.db;
};

exports.close = function(done) {
  if (state.db) {
    mongoose.disconnect(function(err) {
      state.db = null;
      done(err);
    });
  }
};
