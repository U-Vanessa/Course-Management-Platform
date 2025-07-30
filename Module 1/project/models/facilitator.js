'use strict';
module.exports = (sequelize, DataTypes) => {
  const Facilitator = sequelize.define('Facilitator', {
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  }, {});

    Facilitator.associate = function(models) {
  Facilitator.hasMany(models.CourseOffering, { foreignKey: 'facilitatorId' });
};

  return Facilitator;
};