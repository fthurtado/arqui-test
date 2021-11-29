const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
// const sendExampleEmail = require('../../mailers/example');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const TableItemSerializer = new JSONAPISerializer('statistics', {
  attributes: [
    'exchangeName',
    'isActive',
    'stocksNumber',
    'usersNumber'
  ],
  keyForAttribute: 'camelCase',
})

const router = new KoaRouter();

// http://localhost:3000/api/statistics/ (stats del exchange)
router.get('api.statistics.all', '/', async (ctx) => {
  const { userId } = ctx.params;

  //TODO: Exchange model + migration bool + name
  const exchange = await ctx.orm.stock.findAll();
  const exchangeName = exchange[0].dataValues.exchangeName;
  const isActive = exchange[0].dataValues.isActive;

  const users = await ctx.orm.user.findAll();
  const stocks = await ctx.orm.stock.findAll();

  const stocksNumber = await ctx.orm.stock.count();

  const usersNumber = await ctx.orm.user.count();

  if (isActive === false) {
    ctx.throw(404, 'La plataforma de trading esta inactiva.');
  } else {
    ctx.status = 200;
    var response = new Object();
    var innerBody = new Object();
    innerBody.exchangeName = exchangeName;
    innerBody.isActive = isActive;
    innerBody.stocks = stocks;
    innerBody.users = users;
    innerBody.stocksNumber = stocksNumber;
    innerBody.usersNumber = usersNumber;
    response.statistics = innerBody;

    var stats = {
      "statistics": innerBody
    };

    
    ctx.body = stats;
  }
});

module.exports = router;
