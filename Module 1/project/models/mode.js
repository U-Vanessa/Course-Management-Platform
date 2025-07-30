'use strict';
module.exports = (sequelize, DataTypes) => {
  const Mode = sequelize.define('Mode', {
    name: DataTypes.STRING
  }, {});

  Mode.associate = function(models) {
    Mode.hasMany(models.CourseOffering, { foreignKey: 'modeId' });
  };

  return Mode;
};
