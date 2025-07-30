'use strict';
module.exports = (sequelize, DataTypes) => {
  const CourseOffering = sequelize.define('CourseOffering', {
    moduleId: DataTypes.INTEGER,
    facilitatorId: DataTypes.INTEGER,
    classId: DataTypes.INTEGER,
    cohortId: DataTypes.INTEGER,
    trimester: DataTypes.STRING,        // e.g., 'T1', 'T2', 'T3'
    intakePeriod: DataTypes.STRING,     // e.g., 'HT1', 'HT2', 'FT'
    modeId: DataTypes.INTEGER
  }, {});

  CourseOffering.associate = function(models) {
    CourseOffering.belongsTo(models.Module, { foreignKey: 'moduleId' });
    CourseOffering.belongsTo(models.Facilitator, { foreignKey: 'facilitatorId' });
    CourseOffering.belongsTo(models.Class, { foreignKey: 'classId' });
    CourseOffering.belongsTo(models.Cohort, { foreignKey: 'cohortId' });
    CourseOffering.belongsTo(models.Mode, { foreignKey: 'modeId' });
  };

  return CourseOffering;
};
