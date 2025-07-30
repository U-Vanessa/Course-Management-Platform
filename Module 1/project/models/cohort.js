'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cohort = sequelize.define('Cohort', {
    year: DataTypes.INTEGER
  }, {});

  Cohort.associate = function(models) {
    Cohort.hasMany(models.CourseOffering, { foreignKey: 'cohortId' });
  };

  return Cohort;
};
