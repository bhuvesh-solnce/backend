const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");
const { DataTypes } = require('sequelize'); // Import once here

const db = {};

// 1. Recursive function to JUST load models
const loadFilesRecursively = (fileDir) => {
  const files = fs.readdirSync(fileDir);
  
  for (const file of files) {
    const filePath = path.join(fileDir, file);
    if (file.endsWith('.model.js')) {
      try {
        const model = require(filePath)(sequelize, DataTypes);
        db[model.name] = model;
        console.log(`✅ Model File Loaded: ${file}`);
      } catch (error) {
        console.error(`❌ Error loading ${file}:`, error.message);
        throw error;
      }
    } 
    // Check if it's a directory (Recurse)
    else if (fs.statSync(filePath).isDirectory()) {
      loadFilesRecursively(filePath);
    }
  }
};

// 2. Main function to orchestrate the process
const loadModels = async () => {
  try {
    console.log('Starting Model Loading Process...');
    loadFilesRecursively(__dirname);
    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        try {
          db[modelName].associate(db);
          console.log(`🔗 Associations setup for: ${modelName}`);
        } catch (error) {
          console.error(`❌ Association Error in ${modelName}:`, error.message);
          throw error;
        }
      }
    });
    console.log('All Models Loaded & Associated Successfully');
    await sequelize.sync({});
    
    // Add sequelize instance to db object for transaction support
    db.sequelize = sequelize;
    
    return db;
    
  } catch (error) {
    console.error('CRITICAL: Error Loading Models:', error.message);
    throw error;
  }
};

// Add sequelize to db object (available immediately, even before loadModels is called)
db.sequelize = sequelize;

module.exports = { loadModels, db };