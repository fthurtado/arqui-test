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
    const stocksArray = [
      {
        ticker: 'AAPL',
        price: 152.54,
        amount: 79000,
        companyId: "883de095-6eba-499f-9e3f-4a558d5cf6e2",
      },
      {
        ticker: 'S&P 500',
        price: 4524,
        amount: 179000,
        companyId: "c60802f9-e7d9-441e-9148-a5ece385e613",
      },
      {
        ticker: 'DOW J',
        price: 35312,
        amount: 2665000,
        companyId: "b09b7ac9-16cc-44ee-9739-18b52afc059f",
      },
    ];

    const commonData = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert(
      'stocks',
      stocksArray.map((product) => ({ ...product, ...commonData })),
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
