const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectComment extends Model {
    static associate(models) {
      ProjectComment.belongsTo(models.Project, { 
        foreignKey: 'project_id', 
        targetKey: 'project_id',
        as: 'project' ,
        onDelete: 'CASCADE' // <--- ADD THIS
      });
      
      ProjectComment.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
      });
      
      ProjectComment.belongsTo(models.ProjectComment, { 
        foreignKey: 'parent_comment_id', 
        as: 'parent' 
      });
      
      ProjectComment.hasMany(models.ProjectComment, { 
        foreignKey: 'parent_comment_id', 
        as: 'replies' 
      });
      
      ProjectComment.belongsToMany(models.User, {
        through: models.CommentLike,
        foreignKey: 'comment_id',
        otherKey: 'user_id',
        as: 'likedBy'
      });
      
      ProjectComment.hasMany(models.CommentLike, {
        foreignKey: 'comment_id',
        as: 'likes'
      });
    }
  }

  ProjectComment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      parent_comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mentions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'ProjectComment',
      tableName: 'project_comments',
      timestamps: true,
      underscored: true,
    }
  );

  return ProjectComment;
};

