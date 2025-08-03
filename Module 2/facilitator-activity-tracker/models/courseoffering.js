'use strict';

module.exports = (sequelize, DataTypes) => {
  const CourseOffering = sequelize.define('CourseOffering', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    facilitatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalWeeks: {
      type: DataTypes.INTEGER,
      defaultValue: 16
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'course_offerings',
    timestamps: true
  });

  CourseOffering.associate = function(models) {
    // CourseOffering belongs to User (facilitator)
    CourseOffering.belongsTo(models.User, {
      foreignKey: 'facilitatorId',
      as: 'facilitator'
    });
    
    // CourseOffering has many activity trackers
    CourseOffering.hasMany(models.ActivityTracker, {
      foreignKey: 'allocationId',
      as: 'activityLogs'
    });
  };

  return CourseOffering;
};