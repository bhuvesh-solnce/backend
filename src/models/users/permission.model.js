// models/permissions.model.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Connect Permissions to Roles via a junction table
      Permission.belongsToMany(models.Role, { 
        through: 'role_permissions',
        foreignKey: 'permission_id',
        otherKey: 'role_id'
      });
    }
  }

  Permission.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // The "Variable Name" for code (e.g., 'projects.view', 'projects.create')
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    // Human readable description (e.g., 'Can view projects list')
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Optional: Grouping for your Admin UI (e.g., 'Projects', 'System', 'Settings')
    module: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true
  });

  return Permission;
};

