const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentLike extends Model {
    static associate(models) {
      CommentLike.belongsTo(models.ProjectComment, { 
        foreignKey: 'comment_id', 
        as: 'comment' 
      });
      
      CommentLike.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
      });
    }
  }

  CommentLike.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'CommentLike',
      tableName: 'comment_likes',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['comment_id', 'user_id'],
          name: 'unique_comment_like'
        }
      ]
    }
  );

  return CommentLike;
};

