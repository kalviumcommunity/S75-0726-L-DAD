const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  const envPath = process.env.ENV_PATH || path.join(__dirname, '../../.env');
  const result = dotenv.config({ path: envPath });

  // Ensure values from env file are available to child modules.
  // (dotenv does this automatically, but this keeps intent explicit.)


  if (result.error && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[server][env] Could not load .env at:', envPath);
  }

  return result;
}

module.exports = { loadEnv };

