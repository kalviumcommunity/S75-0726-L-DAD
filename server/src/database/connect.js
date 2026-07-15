const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    // Allow server to run (e.g., for UI/dev without DB).
    // When MONGO_URI is provided, Mongo will be connected normally.
    console.warn('[server][mongo] MONGO_URI is not set; skipping Mongo connection.');
    return;
  }


  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // mongoose 9+ defaults are fine; keep minimal options
  });

  // eslint-disable-next-line no-console
  console.log('[server] Connected to MongoDB');
}

module.exports = { connectMongo };

