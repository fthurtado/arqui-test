'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class exchange extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  exchange.init({
    id: {    
      type: DataTypes.UUID,
      primaryKey: true,
    },
    exchangeName: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    APIKey: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'exchange',
  });
  return exchange;
};