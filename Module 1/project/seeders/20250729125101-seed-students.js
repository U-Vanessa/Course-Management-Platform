'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Students', [
      {
        userId: 1, // Assuming user with ID 1 exists
        cohortId: 1, // Assuming cohort with ID 1 exists
        classId: 1, // Assuming class with ID 1 exists
        enrollmentNumber: 'STU001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 2, // Assuming user with ID 2 exists
        cohortId: 1, // Assuming cohort with ID 1 exists
        classId: 1, // Assuming class with ID 1 exists
        enrollmentNumber: 'STU002',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Students', null, {});
  }
};
