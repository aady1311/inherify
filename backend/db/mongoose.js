const mongoose = require('mongoose');

let connectPromise = null;

function connectDB() {
  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.DATABASE_URL).then(() => {
      console.log('Connected to MongoDB');
      return mongoose.connection;
    });
  }
  return connectPromise;
}

module.exports = connectDB;
