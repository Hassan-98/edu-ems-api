const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

const dbConnection = mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
  console.log('\x1b[32m%s\x1b[0m', '✅ [MongoDB] Connected');
});

mongoose.connection.on('error', err => console.log('\x1b[31m%s\x1b[0m', '❌ [MongoDB] Error : ' + err));

mongoose.connection.on('disconnected', () => console.log('\x1b[31m%s\x1b[0m', '❌ [MongoDB] Disconnected...'));

module.exports = dbConnection;
