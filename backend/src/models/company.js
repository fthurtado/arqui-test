const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

const PASSWORD_SALT_ROUNDS = 10;

module.exports = (sequelize, DataTypes) => {
  class company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    /* eslint-enable no-unused-vars */
    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  };
  company.init({
    id: {    
      type: DataTypes.UUID,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    ticker: DataTypes.STRING,
    balance: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'company',
  });

  company.beforeSave(async (instance) => {
    if (instance.changed('password')) {
      const hash = await bcrypt.hash(instance.password, PASSWORD_SALT_ROUNDS);
      instance.set('password', hash);
    }
  });

  return company;
};