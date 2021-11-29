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
     const usersArray = [
      {
        id: 'd0f9808f-54fd-44ad-95ce-7af611509b07',
        nick: 'Admin',
        email: 'admin@uc.cl',
        password: '$2b$10$wrme6drI8XUlArLOUF21hOKshLdlvz2SbjMMZJOujPm0Sz27nxOdG',
        balance: 10000,
        member: false,
        isAdmin: true,
        isActive: true,
      },
      {
        id: 'd0f9808f-54fd-44ad-95ce-7af611509b08',
        nick: 'user1',
        email: 'test-user@test.cl',
        password: '$2b$10$wrme6drI8XUlArLOUF21hOKshLdlvz2SbjMMZJOujPm0Sz27nxOdG',
        balance: 10000,
        member: false,
        isAdmin: false,
        isActive: true,
      },
      {
        id: 'd0f9808f-54fd-44ad-95ce-7af611509b09',
        nick: 'user2',
        email: 'test-user2@test.cl',
        password: '$2b$10$wrme6drI8XUlArLOUF21hOKshLdlvz2SbjMMZJOujPm0Sz27nxOdG',
        balance: 10000,
        member: false,
        isAdmin: false,
        isActive: true,
      },
    ];

    const commonData = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert(
      'users',
      usersArray.map((user) => ({ ...user, ...commonData })),
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
