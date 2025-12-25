const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
      Role.belongsToMany(models.Permission, { 
        through: 'role_permissions', // This creates the junction table automatically
        foreignKey: 'role_id',
        otherKey: 'permission_id',
        as: 'permissions' // Important alias for querying
      });
    }
  }

  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_system: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'System roles cannot be deleted',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
      paranoid: true, 
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['name'],
          name: 'idx_roles_name', // Custom index name from your schema
        },
        {
          fields: ['is_active'],
          name: 'idx_roles_is_active',
        },
      ],
    }
  );

  return Role;
};