'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('facilitator', 'manager', 'admin'),
      allowNull: false,
      defaultValue: 'facilitator'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = function(models) {
    // User has many course offerings (as facilitator)
    User.hasMany(models.CourseOffering, {
      foreignKey: 'facilitatorId',
      as: 'courseOfferings'
    });
    
    // User has many activity logs
    User.hasMany(models.ActivityTracker, {
      foreignKey: 'facilitatorId',
      as: 'activityLogs'
    });
  };

  return User;
};