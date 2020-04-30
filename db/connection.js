const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection
  .on('open', () => console.log('Connected to DB'))
  .on('error', console.error);

module.exports = mongoose.connection;
