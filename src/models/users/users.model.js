const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      if (models.Role) {
        User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'roleData' });
      }
      User.belongsTo(User, { foreignKey: 'refer_by_code', targetKey: 'refer_code', as: 'referrer' });
    }

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      delete values.refresh_token;
      delete values.otp;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // --- Identity ---
      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      // --- Profile ---
      first_name: DataTypes.STRING(100),
      last_name: DataTypes.STRING(100),
      mobile: DataTypes.STRING(20),
      dial_code: DataTypes.STRING(10),

      // --- Access Control ---
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Set to false to disable login without deleting the user',
      },

      // --- Referrals ---
      refer_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true,
        comment: 'Unique code for this user to share',
      },
      refer_by_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'The refer_code of the person who invited this user',
      },

      // --- Verification & Security ---
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_mobile_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otp: DataTypes.INTEGER,
      otp_expiry_time: DataTypes.DATE,

      // --- Authentication Tokens ---
      refresh_token: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      // --- Social Login ---
      google_id: DataTypes.STRING(255),
      apple_id: DataTypes.STRING(255),
      
      // --- Notifications ---
      fcm_token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          // 1. Hash Password
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
          // 2. Auto-generate refer_code if not provided
          if (!user.refer_code) {
             // Generates a random 8-char hex code (e.g., 'a3f910bc')
            user.refer_code = crypto.randomBytes(4).toString('hex');
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};