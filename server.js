require('dotenv').config();
const app = require('./src/app');
const { loadModels } = require('./src/models');
//const listEndpoints = require('express-list-endpoints');

const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;

async function startServer() {
  try {
    await loadModels();
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
}

startServer();

