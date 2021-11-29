'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     const exchangeArray = [
      {
        id: '8b157eb9-1965-4d56-b52a-c2abb4231dc5',
        exchangeName: 'FintechG20',
        isActive: true,
        APIKey: '29b4975e-9051-4f3a-9fe1-ce0ab2c70134'
      }
    ];


    await queryInterface.bulkInsert(
      'exchanges',
      exchangeArray.map((exchange) => ({ ...exchange })),
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
