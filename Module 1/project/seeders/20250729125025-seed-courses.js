'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Courses', [
      {
        title: 'Algebra I',
        description: 'Introductory Algebra',
        credits: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Physics Basics',
        description: 'Mechanics and Thermodynamics',
        credits: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Courses', null, {});
  }
};
