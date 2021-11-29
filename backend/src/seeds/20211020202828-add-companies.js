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
     const companiesArray = [
      {
        id: "883de095-6eba-499f-9e3f-4a558d5cf6e2",
        name: 'Apple Inc.',
        email: 'AppleInc@icloud.com',
        password: '$2b$10$J489jh4CfjvtnU.671QSG.t3vcg3Peb35i/pxmDvvp5tv.i5oCZsO',
        ticker: 'AAPL',
        balance: 10000,
      },
      { id: "c60802f9-e7d9-441e-9148-a5ece385e613",
        name: 'S&P 500',
        email: 'S&P500@gmail.com',
        password: '$2b$10$J489jh4CfjvtnU.671QSG.t3vcg3Peb35i/pxmDvvp5tv.i5oCZsO',
        ticker: 'S&P 500',
        balance: 10000,
      },
      {
        id: "b09b7ac9-16cc-44ee-9739-18b52afc059f",
        name: 'Dow Jones Industrial Average',
        email: 'DOWJ@gmail.com',
        password: '$2b$10$J489jh4CfjvtnU.671QSG.t3vcg3Peb35i/pxmDvvp5tv.i5oCZsO',
        ticker: 'DOW J',
        balance: 10000,
      },
      {
        id: "a5f5330b-c828-4c59-92a8-40b8e6772114",
        name: 'Tesla',
        email: 'Tesla@gmail.com',
        password: '$2b$10$J489jh4CfjvtnU.671QSG.t3vcg3Peb35i/pxmDvvp5tv.i5oCZsO',
        ticker: 'TSL',
        balance: 10500,
      },
    ];

    const commonData = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert(
      'companies',
      companiesArray.map((company) => ({ ...company, ...commonData })),
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
