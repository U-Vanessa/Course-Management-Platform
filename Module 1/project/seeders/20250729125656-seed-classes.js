'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Classes', [
      {
        name: 'Computer Science Class A',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mathematics Class B',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Classes', null, {});
  }
};