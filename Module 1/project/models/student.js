'use strict';
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    cohortId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Cohorts',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    enrollmentNumber: DataTypes.STRING
  }, {});

  Student.associate = function(models) {
    Student.belongsTo(models.User, { foreignKey: 'userId' });
    Student.belongsTo(models.Class, { foreignKey: 'classId' });
    Student.belongsTo(models.Cohort, { foreignKey: 'cohortId' });
    Student.belongsToMany(models.Course, { 
      through: 'StudentCourses',
      foreignKey: 'studentId',
      otherKey: 'courseId'
    });
  };

  return Student;
};
