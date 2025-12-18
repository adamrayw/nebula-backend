'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
     DROP TYPE IF EXISTS "enum_Activities_type" CASCADE;
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Activities_type" AS ENUM ('upload', 'download', 'delete', 'share', 'edit', 'view', 'undo', 'trash');
    `);

    await queryInterface.createTable('Activities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('upload', 'download', 'delete', 'share', 'edit', 'view', 'undo', 'trash'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Activities');
  }
};
