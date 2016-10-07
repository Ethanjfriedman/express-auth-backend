import { Schema } from 'mongoose';
const Teacher = Schema({
  username: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = Teacher;
