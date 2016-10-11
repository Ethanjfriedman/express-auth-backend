import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default mongoose.model('User', new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  teacher: Boolean,
  admin: Boolean
}));
