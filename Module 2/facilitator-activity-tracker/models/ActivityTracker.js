'use strict';

module.exports = (sequelize, DataTypes) => {
  const ActivityTracker = sequelize.define('ActivityTracker', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    allocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_offerings',
        key: 'id'
      }
    },
    facilitatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    weekNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 16
      }
    },
    attendance: {
      type: DataTypes.JSON, // Store array of booleans
      allowNull: true,
      defaultValue: []
    },
    formativeOneGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    formativeTwoGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    summativeGrading: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    courseModeration: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    intranetSync: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    gradeBookStatus: {
      type: DataTypes.ENUM('Done', 'Pending', 'Not Started'),
      allowNull: false,
      defaultValue: 'Not Started'
    },
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'activity_trackers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['allocationId', 'weekNumber']
      },
      {
        fields: ['facilitatorId']
      },
      {
        fields: ['weekNumber']
      }
    ]
  });

  ActivityTracker.associate = function(models) {
    // ActivityTracker belongs to CourseOffering
    ActivityTracker.belongsTo(models.CourseOffering, {
      foreignKey: 'allocationId',
      as: 'courseOffering'
    });
    
    // ActivityTracker belongs to User (facilitator)
    ActivityTracker.belongsTo(models.User, {
      foreignKey: 'facilitatorId',
      as: 'facilitator'
    });
  };

  return ActivityTracker;
};