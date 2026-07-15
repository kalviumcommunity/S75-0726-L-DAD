const { createServer } = require('./server');

const PORT = process.env.PORT || 5000;

createServer().listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Listening on port ${PORT}`);
});

