'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CourseOfferings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Foreign key: Module
      moduleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      // Foreign key: Facilitator
      facilitatorId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Facilitators',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      // Foreign key: Class
      classId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Classes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      // Foreign key: Cohort
      cohortId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cohorts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      // Foreign key: Mode
      modeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Modes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      trimester: {
        type: Sequelize.STRING
      },

      intakePeriod: {
        type: Sequelize.STRING
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CourseOfferings');
  }
};
