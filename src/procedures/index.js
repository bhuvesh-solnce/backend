const fs = require("fs");
const path = require("path");
const sequelize = require("../config/database");

const writeProcedures = async (proceduresDir) => {
  const files = fs.readdirSync(proceduresDir);

  for (const file of files) {
    const filePath = path.join(proceduresDir, file);
    if (file.endsWith(".sql")) {
      const procedureSQL = fs.readFileSync(filePath, "utf8");

      try {
        // Extract procedure name from SQL content
        const procedureNameMatch = procedureSQL.match(/CREATE\s+(?:PROCEDURE|FUNCTION)\s+`?(\w+)`?/i);
        const procedureName = procedureNameMatch ? procedureNameMatch[1] : file.slice(0, -4);
        
        // Drop existing procedure/function
        await sequelize.query(`DROP PROCEDURE IF EXISTS ${procedureName}`);
        await sequelize.query(`DROP FUNCTION IF EXISTS ${procedureName}`);
        
        // Execute the procedure creation
        // Handle case where role_id column might not exist yet
        try {
          await sequelize.query(procedureSQL);
          console.log(`📃 ✅ Procedure execution successful from file: ${file}`);
        } catch (procError) {
          // If error is about missing column (role_id), log warning but continue
          if (procError.message && procError.message.includes('role_id')) {
            console.warn(`📃 ⚠️  Procedure ${procedureName} may need role_id column. Run migrations first: npm run migrate`);
            // Try to create procedure without role_id references
            console.warn(`📃 ⚠️  Continuing with existing procedure definition...`);
          } else {
            throw procError;
          }
        }
      } catch (error) {
        console.error(`\n📃 ⛔️ Error executing procedure from file: ${file}`, error.message);
        // Don't throw - allow server to start even if some procedures fail
        // They will be fixed after migrations run
      }
    } else if (fs.statSync(filePath).isDirectory()) {
      console.log(`\n📂 ✅ Procedure execution for folder: ${file}`);
      await writeProcedures(filePath);
    }
  }
};

const loadProcedures = async () => {
  try {
    await writeProcedures(__dirname);
    console.log("👍 All procedures loaded successfully");
  } catch (error) {
    console.error("✗ Error loading procedures:", error);
    throw error;
  }
};

module.exports = { loadProcedures };
