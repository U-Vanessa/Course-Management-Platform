'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Facilitators', [
      {
        name: 'Alice Mugenzi',
        email: 'alice@example.com',
        password: '$2a$10$example.hashed.password.here',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Niyonzima',
        email: 'john@example.com',
        password: '$2a$10$example.hashed.password.here',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Facilitators', null, {});
  }
};
