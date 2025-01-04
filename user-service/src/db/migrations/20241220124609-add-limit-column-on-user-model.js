'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'limit', {
      type: Sequelize.BIGINT,
      allowNull: true,
      defaultValue: 52428800
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'limit')
  }
};
