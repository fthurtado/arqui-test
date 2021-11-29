'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class blockedUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  blockedUser.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }}, {
    sequelize,
    modelName: 'blockedUser',
  });
  return blockedUser;
};