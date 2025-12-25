const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LeadHistory extends Model {
    static associate(models) {
      LeadHistory.belongsTo(models.Project, {
        foreignKey: 'project_id',
        targetKey: 'project_id',
        as: 'project'
      });
      
      if (models.User) {
        LeadHistory.belongsTo(models.User, {
          foreignKey: 'changed_by_user_id',
          as: 'changedBy'
        });
      }
    }
  }

  LeadHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      project_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'project_id'
        }
      },
      old_status: {
        type: DataTypes.STRING,
        allowNull: true
      },
      new_status: {
        type: DataTypes.STRING,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      changed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'LeadHistory',
      tableName: 'lead_history',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['project_id']
        },
        {
          fields: ['changed_by_user_id']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );

  return LeadHistory;
};

