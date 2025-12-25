'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      project_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'project_id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      parent_comment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'project_comments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      mentions: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of user IDs mentioned in the comment'
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('comment_likes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'project_comments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate likes
    try {
      await queryInterface.addIndex('comment_likes', ['comment_id', 'user_id'], {
        unique: true,
        name: 'unique_comment_like'
      });
    } catch (error) {
      // Index might already exist, ignore error
      console.log('Index unique_comment_like might already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comment_likes');
    await queryInterface.dropTable('project_comments');
  }
};

