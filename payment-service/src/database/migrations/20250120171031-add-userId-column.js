'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payments', 'userId', {
      allowNull: false,
      type: Sequelize.UUID,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Payments', 'userId');
  },
};
