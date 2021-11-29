'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class limitOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  limitOrder.init({
    idUser: DataTypes.UUID,
    ticker: DataTypes.STRING,
    price: DataTypes.FLOAT,
    kind: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    isActive: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'limitOrder',
  });
  return limitOrder;
};