'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Vanessa Uwase',
        email: 'vanessa@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Eric Mugisha',
        email: 'eric@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};