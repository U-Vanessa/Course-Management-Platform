'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_trackers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      allocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'course_offerings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      facilitatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weekNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 16
        }
      },
      attendance: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]'
      },
      formativeOneGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      formativeTwoGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      summativeGrading: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      courseModeration: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      intranetSync: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      gradeBookStatus: {
        type: Sequelize.ENUM('Done', 'Pending', 'Not Started'),
        allowNull: false,
        defaultValue: 'Not Started'
      },
      submissionDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('activity_trackers', ['allocationId', 'weekNumber'], {
      unique: true,
      name: 'unique_allocation_week'
    });
    
    await queryInterface.addIndex('activity_trackers', ['facilitatorId']);
    await queryInterface.addIndex('activity_trackers', ['weekNumber']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_trackers');
  }
};
