const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/react-authentication-backend';

export default {
  'secret': 'Cleo ALWAYS gets the ball!!',
  'database': mongoURI
}
