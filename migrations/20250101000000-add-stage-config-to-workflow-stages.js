'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add stage_config column to workflow_stages table
    // MySQL JSON columns don't support default values directly, so we use TEXT and convert
    await queryInterface.addColumn('workflow_stages', 'stage_config', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Configuration for specialized modules (e.g. Milestones for Tracking, Columns for BOQ)"
    });

    // Set default empty JSON object for existing rows
    await queryInterface.sequelize.query(`
      UPDATE workflow_stages 
      SET stage_config = '{}' 
      WHERE stage_config IS NULL
    `);

    // Update ENUM to include QUOTATION_BOQ type
    // Note: MySQL doesn't support ALTER ENUM easily, so we'll need to recreate the column
    // This is a safe operation that preserves existing data
    await queryInterface.sequelize.query(`
      ALTER TABLE workflow_stages 
      MODIFY COLUMN type ENUM(
        'FORM', 
        'APPROVAL', 
        'QUOTATION', 
        'QUOTATION_BOQ',
        'BOQ_GENERATION', 
        'PDF_GENERATION', 
        'COMPUTATION',
        'PAYMENT',
        'GOVT_PORTAL', 
        'DOCUMENT_CHECKLIST', 
        'PROJECT_TRACKING', 
        'QC_CHECKLIST', 
        'SERVICE_CALL', 
        'VENDOR_ASSIGNMENT'
      ) NOT NULL DEFAULT 'FORM'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove stage_config column
    await queryInterface.removeColumn('workflow_stages', 'stage_config');

    // Revert ENUM to original (without QUOTATION_BOQ)
    await queryInterface.sequelize.query(`
      ALTER TABLE workflow_stages 
      MODIFY COLUMN type ENUM(
        'FORM', 
        'APPROVAL', 
        'QUOTATION', 
        'BOQ_GENERATION', 
        'PDF_GENERATION', 
        'COMPUTATION',
        'PAYMENT',
        'GOVT_PORTAL', 
        'DOCUMENT_CHECKLIST', 
        'PROJECT_TRACKING', 
        'QC_CHECKLIST', 
        'SERVICE_CALL', 
        'VENDOR_ASSIGNMENT'
      ) NOT NULL DEFAULT 'FORM'
    `);
  }
};

