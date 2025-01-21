'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Payments', 'type', {
        type: Sequelize.ENUM(['personal', 'professional', 'business']),
        allowNull: false,
        defaultValue: 'personal',
      });
      await queryInterface.addColumn('Payments', 'status', {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false,
      });
      await queryInterface.addColumn('Payments', 'price', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('Payments', 'type');
      await queryInterface.removeColumn('Payments', 'status');
      await queryInterface.removeColumn('Payments', 'price');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
