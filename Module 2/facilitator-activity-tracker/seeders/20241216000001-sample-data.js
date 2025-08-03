'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 12;
    
    // Create sample users
    const users = [
      {
        name: 'John Facilitator',
        email: 'john.facilitator@alu.edu',
        password: await bcrypt.hash('password123', saltRounds),
        role: 'facilitator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Facilitator',
        email: 'jane.facilitator@alu.edu',
        password: await bcrypt.hash('password123', saltRounds),
        role: 'facilitator',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Manager',
        email: 'bob.manager@alu.edu',
        password: await bcrypt.hash('password123', saltRounds),
        role: 'manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Alice Admin',
        email: 'alice.admin@alu.edu',
        password: await bcrypt.hash('password123', saltRounds),
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);

    // Get the created user IDs (assuming they start from 1)
    const createdUsers = await queryInterface.sequelize.query(
      'SELECT id, email FROM users WHERE email IN (?)',
      {
        replacements: [users.map(u => u.email)],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const facilitator1 = createdUsers.find(u => u.email === 'john.facilitator@alu.edu');
    const facilitator2 = createdUsers.find(u => u.email === 'jane.facilitator@alu.edu');

    // Create sample course offerings
    const courseOfferings = [
      {
        courseName: 'Introduction to Programming',
        courseCode: 'CS101',
        semester: 'Fall',
        year: 2024,
        facilitatorId: facilitator1.id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseName: 'Data Structures and Algorithms',
        courseCode: 'CS201',
        semester: 'Fall',
        year: 2024,
        facilitatorId: facilitator1.id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseName: 'Database Management Systems',
        courseCode: 'CS301',
        semester: 'Fall',
        year: 2024,
        facilitatorId: facilitator2.id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseName: 'Web Development',
        courseCode: 'CS401',
        semester: 'Spring',
        year: 2025,
        facilitatorId: facilitator2.id,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('course_offerings', courseOfferings);

    // Get the created course offering IDs
    const createdCourses = await queryInterface.sequelize.query(
      'SELECT id, courseCode FROM course_offerings WHERE courseCode IN (?)',
      {
        replacements: [courseOfferings.map(c => c.courseCode)],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Create sample activity tracker entries for first few weeks
    const activityTrackers = [];
    
    for (const course of createdCourses.slice(0, 2)) { // Only for first 2 courses
      for (let week = 1; week <= 4; week++) {
        activityTrackers.push({
          allocationId: course.id,
          facilitatorId: course.courseCode === 'CS101' ? facilitator1.id : facilitator2.id,
          weekNumber: week,
          attendance: JSON.stringify([true, true, false, true, true]), // 5-day week attendance
          formativeOneGrading: week <= 2 ? 'Done' : week === 3 ? 'Pending' : 'Not Started',
          formativeTwoGrading: week === 1 ? 'Done' : week === 2 ? 'Pending' : 'Not Started',
          summativeGrading: week === 1 ? 'Done' : 'Not Started',
          courseModeration: week <= 2 ? 'Done' : 'Not Started',
          intranetSync: week <= 3 ? 'Done' : 'Pending',
          gradeBookStatus: week <= 2 ? 'Done' : week === 3 ? 'Pending' : 'Not Started',
          submissionDate: week <= 2 ? new Date() : null,
          lastUpdated: new Date(),
          notes: `Week ${week} activities for ${course.courseCode}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await queryInterface.bulkInsert('activity_trackers', activityTrackers);

    console.log('✅ Sample data seeded successfully!');
    console.log('📧 Sample user credentials:');
    console.log('   Facilitator: john.facilitator@alu.edu / password123');
    console.log('   Facilitator: jane.facilitator@alu.edu / password123');
    console.log('   Manager: bob.manager@alu.edu / password123');
    console.log('   Admin: alice.admin@alu.edu / password123');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('activity_trackers', null, {});
    await queryInterface.bulkDelete('course_offerings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
