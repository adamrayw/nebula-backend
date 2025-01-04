'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      mimeType: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.INTEGER
      },
      originalName: {
        type: Sequelize.STRING
      },
      location: {
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

    await queryInterface.addColumn(
      'Files',
      'userId',
      {
        type: Sequelize.UUID,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    )
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Files');
  }
};