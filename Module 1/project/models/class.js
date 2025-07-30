'use strict';
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    name: DataTypes.STRING
  }, {});

  Class.associate = function(models) {
    Class.hasMany(models.CourseOffering, { foreignKey: 'classId' });
  };

  return Class;
};
