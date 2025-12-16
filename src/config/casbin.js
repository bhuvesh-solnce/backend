const { newEnforcer } = require('casbin');
const { SequelizeAdapter } = require('casbin-sequelize-adapter');
const path = require('path');
const sequelize = require('./database');

let enforcer = null;

/**
 * Initialize Casbin enforcer with Sequelize adapter
 * @returns {Promise<Enforcer>} Casbin enforcer instance
 */
async function initCasbin() {
  try {
    // Create adapter with Sequelize instance
    const adapter = await SequelizeAdapter.newAdapter(sequelize, {
      // Table name for storing policies (default: 'casbin_rule')
      tableName: 'casbin_rule'
    });

    // Path to the Casbin model file
    const modelPath = path.join(__dirname, '../models/rbac_model.conf');

    // Create enforcer with model and adapter
    enforcer = await newEnforcer(modelPath, adapter);

    // Enable auto-save (automatically save policy changes to database)
    enforcer.enableAutoSave(true);

    // Enable auto-build role links (automatically build role inheritance)
    await enforcer.enableAutoBuildRoleLinks();

    console.log('✅ Casbin enforcer initialized successfully');
    return enforcer;
  } catch (error) {
    console.error('❌ Error initializing Casbin:', error);
    throw error;
  }
}

/**
 * Get the Casbin enforcer instance
 * @returns {Enforcer} Casbin enforcer instance
 */
function getEnforcer() {
  if (!enforcer) {
    throw new Error('Casbin enforcer not initialized. Call initCasbin() first.');
  }
  return enforcer;
}

module.exports = {
  initCasbin,
  getEnforcer
};
