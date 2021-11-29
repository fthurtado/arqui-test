require('dotenv').config();
const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const jwt = require('jsonwebtoken');

const StockSerializer = new JSONAPISerializer('stocks', {
  attributes: [
    'id',
    'ticker',
    'price',
    'amount',
    'companyId',
    'createdAt',
    'updatedAt'],
  keyForAttribute: 'camelCase',
});

const router = new KoaRouter();

// http://localhost:3000/api/stock/ (obtengo todas los productos)
router.get('api.stocks.all', '/', async (ctx) => {
  try {
    const authHeader = ctx.request.headers.authorization;
    const token = authHeader.substring(7, authHeader.length);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const companyId = decoded.sub;
    const user = await ctx.orm.user.findOne({ where: { id: userId } });
    const company = await ctx.orm.company.findOne({ where: { id: companyId } });
    if (user) {
      const stocksList = await ctx.orm.stock.findAll();
      if (stocksList.length === 0) {
        ctx.throw(404, 'No hay stock registrados');
      } else {
        ctx.status = 200;
        ctx.body = StockSerializer.serialize(stocksList);
      }
    } else if (company) {
      const stocksList = await ctx.orm.stock.findAll();
      if (stocksList.length === 0) {
        ctx.throw(404, 'No hay stock registrados');
      } else {
        ctx.status = 200;
        ctx.body = StockSerializer.serialize(stocksList);
      }
    }
    else {
      ctx.throw(401, 'Token incorrecto');
    }
  }
  catch {
    ctx.throw(401, 'Token incorrecto');
  }
});

// http://localhost:3000/api/stock/company/1 (obtengo los stocks por id de compañía)
router.get('api.stock.show', '/company/:companyId', async (ctx) => {
  const { companyId } = ctx.params;
  const stocks = await ctx.orm.stock.findAll({ where: { companyId: companyId } });
  if (stocks.length === 0) {
    ctx.throw(404, 'El stock que estas buscando no existe!');
  }
  ctx.status = 200;
  ctx.body = StockSerializer.serialize(stocks);
});

// http://localhost:3000/api/stock/user/1 (obtengo los stocks por id de usuario)
router.get('api.stock.show', '/user/:userId', async (ctx) => {
  const { userId } = ctx.params;
  try {
    const transactionList = await ctx.orm.transaction.findAll({ where: { idUser: userId } });
    const stocks = {};
    transactionList.forEach(transaction => {
      if (!Object.keys(stocks).includes('' + transaction.stockId)){
        stocks[transaction.stockId] = 0;
      }
      if (transaction.kind == "sell"){
        stocks[transaction.stockId] -= transaction.amount;
      } else {
        stocks[transaction.stockId] += transaction.amount;
      }
    });
    const response = [];
    for (let index = 0; index < Object.keys(stocks).length; index++) {
      const stock_id = Object.keys(stocks)[index];
      const stock = await ctx.orm.stock.findOne({ where: { id: stock_id } });
      const fullStock = {
        ...stock.dataValues,
        userAmount: stocks[stock_id],
      }
      console.log({fullStock})
      response.push(fullStock);
    }
    ctx.body = response;
    ctx.status = 200;
  } catch (error) {
    ctx.throw(400);
    ctx.body = error;
  }
});

// http://localhost:3000/api/stock/1 (obtengo los stocks por id de stock)
router.get('api.stock.show', '/:stockId', async (ctx) => {
  const { stockId } = ctx.params;
  const stock = await ctx.orm.stock.findOne({ where: { id: stockId } });
  if (!stock) {
    ctx.throw(404, 'El stock que estas buscando no existe!');
  }
  ctx.status = 200;
  ctx.body = StockSerializer.serialize(stock);
});

// http://localhost:3000/api/stock/:idCompany (post para que una compañia agregue mas stock(crea))
router.post('api.stock.addStock', '/:companyId', async (ctx) => {
  try {
    const newStock = ctx.orm.stock.build({
      ticker: ctx.request.body.ticker,
      price: ctx.request.body.price,
      amount: ctx.request.body.amount,
      companyId: ctx.params.companyId,
    });
    await newStock.save({
      field: ['ticker', 'price',
      'amount', 'companyId'],
    });
    ctx.status = 201;
    ctx.body = StockSerializer.serialize(newStock);
  } catch (ValidationError) {
    ctx.throw(400);
    ctx.body = ValidationError;
  }
});

// http://localhost:3000/api/stock/Update/:idStock (update del stock, actualiza el precio y la cantidad)
router.patch('api.stock.edit', '/Update/:idStock', async (ctx) => {
  const stock = await ctx.orm.stock.findByPk(ctx.params.idStock);
  if (!stock) {
    ctx.throw(404, 'El stock que estas buscando no existe!');
  }
  try {
    await ctx.orm.stock.update(ctx.request.body, { where: { id: ctx.params.idStock } });
    const stockBody = await ctx.orm.stock.findByPk(ctx.params.idStock);
    ctx.status = 200;
    ctx.body = StockSerializer.serialize(stockBody);
  } catch (ValidationError) {
    ctx.throw(400);
    ctx.body = ValidationError;
  }

});

module.exports = router;
