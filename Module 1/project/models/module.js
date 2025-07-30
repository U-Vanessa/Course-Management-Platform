'use strict';
module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    name: DataTypes.STRING,
    code: {
      type: DataTypes.STRING,
      unique: true
    },
    description: DataTypes.TEXT
  }, {});

  Module.associate = function(models) {
    Module.hasMany(models.CourseOffering, { foreignKey: 'moduleId' });
  };

  return Module;
};
