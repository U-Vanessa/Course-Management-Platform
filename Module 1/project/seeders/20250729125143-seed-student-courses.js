'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('StudentCourses', [
      {
        studentId: 1,
        courseId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        studentId: 2,
        courseId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('StudentCourses', null, {});
  }
};
