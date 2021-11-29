'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('exchanges', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      exchangeName: {
        type: Sequelize.STRING
      },
      isActive: {
        type: Sequelize.BOOLEAN
      },
      APIKey: {
        type: Sequelize.UUID
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exchanges');
  }
};