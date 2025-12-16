require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');
const { initCasbin } = require('./src/config/casbin');

const DB_PORT = process.env.DB_PORT;

async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
    
    // Initialize Casbin
    await initCasbin();
    
    // Start server
    app.listen(DB_PORT, () => {
      console.log(`🚀 Server running on http://localhost:${DB_PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();