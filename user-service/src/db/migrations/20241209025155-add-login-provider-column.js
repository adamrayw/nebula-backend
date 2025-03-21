'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Users',
      'login_provider', {
      type: Sequelize.STRING,
      allowNull: true,
    }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'login_provider')
  }
};
