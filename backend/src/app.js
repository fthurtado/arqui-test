const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const koaFlashMessage = require('koa-flash-message').default;
const koaStatic = require('koa-static');
const render = require('koa-ejs');
const session = require('koa-session');
const cors = require('@koa/cors');
const override = require('koa-override-method');
const assets = require('./assets');
const mailer = require('./mailers');
const orm = require('./models');
const api = require('./routes/api');
const cron = require('node-cron');
const KoaRouter = require('koa-router');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const { Op } = require("sequelize");

// App constructor
const app = new Koa();

const developmentMode = app.env === 'development';
const testMode = app.env === 'test';

app.keys = [
  'these secret keys are used to sign HTTP cookies',
  'to make sure only this app can generate a valid one',
  'and thus preventing someone just writing a cookie',
  'saying he is logged in when it\'s really not',
];

// expose ORM through context's prototype
app.context.orm = orm;

/**
 * Middlewares
 */

// CORS
app.use(cors({ origin: process.env.ORIGIN || 'http://localhost:8000' }));

// expose running mode in ctx.state
app.use((ctx, next) => {
  ctx.state.env = ctx.app.env;
  return next();
});

// log requests
if (!testMode) {
  app.use(koaLogger());
}

// webpack middleware for dev mode only
if (developmentMode) {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const koaWebpack = require('koa-webpack');
  koaWebpack()
    .then((middleware) => app.use(middleware))
    .catch(console.error); // eslint-disable-line no-console
}

app.use(koaStatic(path.join(__dirname, '..', 'build'), {}));

// expose a session hash to store information across requests from same client
app.use(session({
  maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
}, app));

// flash messages support
app.use(koaFlashMessage);

// parse request body
app.use(koaBody({
  multipart: true,
  keepExtensions: true,
}));

app.use((ctx, next) => {
  ctx.request.method = override.call(ctx, ctx.request.body.fields || ctx.request.body);
  return next();
});

// Configure EJS views
app.use(assets(developmentMode));
render(app, {
  root: path.join(__dirname, 'views'),
  viewExt: 'html.ejs',
  cache: !developmentMode,
});

mailer(app);

// Routing middleware
app.use(api.routes());

const updateForeignBalance = async (chargeAmount) => {
  const response = await fetch('http://example.com/movies.json', {
    method: 'POST',
    body: {"charge": chargeAmount}, // string or object
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const myJson = await response.json(); //extract JSON from the http response
  // do something with myJson
}

//running cron engine trnsaction thingy
cron.schedule('*/5 * * * * *', async function() {
  const tickers = await app.context.orm.company.findAll({
    attributes: ['ticker', 'id']
  });
  // let contador = 0;

  // console.log("tickers", tickers);
  for(const ticker of tickers){
    // contador += 1;
    // console.log(contador); 
    // console.log(tickers.dataValues.ticker);
    const SKR = ticker.dataValues.ticker;
    console.log(SKR);
    const stockid = await app.context.orm.stock.findOne({
      where: {
            ticker: SKR,
            },
      attributes: ['id']
    });
    // console.log(stockid);
  const limitSell = await app.context.orm.limitOrder.findAll({ 
    where: { kind: 'sell',
            isActive: true,
            ticker: SKR,
            amount: {
              [Op.ne]: 0,
            }
            }, 
    order: [
      ['price', 'ASC'],
      ['amount', 'DESC'],
    ], 
  });
  const limitPurchase = await app.context.orm.limitOrder.findAll({ 
    where: { kind: "buy",
            isActive: true,
            ticker: SKR,
            amount: {
              [Op.ne]: 0,
            }
            },  
    order: [
      ['price', 'DESC'],
      ['amount', 'DESC'],
    ],  
  });

    // console.log("limitPurchases",limitPurchase);
    // console.log("limitSell", limitSell);
    // console.log("finish");
    // console.log("1");
    if (limitPurchase.length != 0 && limitSell.length != 0) {
      console.log(limitPurchase);
      const sellerID = limitSell[0].dataValues.idUser;
      const buyerID = limitPurchase[0].dataValues.idUser;

      const sellerOrderID = limitSell[0].id;
      const buyerOrderID = limitPurchase[0].id;
      
      const bestSellPrice = limitSell[0].dataValues.price;
      const bestPurchasePrice = limitPurchase[0].dataValues.price;
      
      const bestSellAmount= limitSell[0].dataValues.amount;
      const bestPurchaseAmount = limitPurchase[0].dataValues.amount;
      // console.log("2");
      
    console.log("Price Purchases",bestPurchasePrice);
    console.log("Price Sell", bestSellPrice);

    if(bestSellPrice <= bestPurchasePrice){
      // console.log("3");
      // const minAmount = 0; // Math.min(bestSellerAmount, bestPurchaseAmount)
      var buyerUser = await app.context.orm.user.findOne({ where: {id: buyerID} });
      var sellerUser = await app.context.orm.user.findOne({ where: {id: sellerID} });
      const minAmount = Math.min(bestSellAmount, bestPurchaseAmount);
      // console.log("minAmount", minAmount);
      const newSellAmount = bestSellAmount - minAmount;
      const newBuyAmount = bestPurchaseAmount - minAmount;

      //Update Both Limit Orders - Amount transacted
      if(buyerUser.balance >= minAmount*bestSellPrice){
        console.log("0");
        await app.context.orm.limitOrder.update({
          amount : newSellAmount
        }, {
          where: {
            id: sellerOrderID
          }
        })
        
        await app.context.orm.limitOrder.update({
          amount : newBuyAmount
        }, {
          where: {
            id: buyerOrderID
          }
        })
        console.log("1");
        //Les actualizamos los balances
/*         console.log("-------------------------------BUYER----------------------", buyerUser);
        await app.context.orm.user.update({
          balance : buyerUser.balance - (minAmount*bestSellPrice)
        }, {
          where: {
            id: buyerID
          }
        });
        await app.context.orm.user.update({
          balance : sellerUser.balance + minAmount*bestSellPrice
        }, {
          where: {
            id: sellerID
          }
        }); */
        await app.context.orm.user.increment({balance: -(minAmount*bestSellPrice)}, { where: { id: buyerID } })
        await app.context.orm.user.increment({balance: minAmount*bestSellPrice}, { where: { id: sellerID } })

        await app.context.orm.user.update({
          amount : newBuyAmount
        }, {
          where: {
            idUser: buyerID
          }
        })
        console.log("2");

        //TODO: API Call to update client balance
        //updateForeignBalance((minAmount*bestSellPrice));

        // console.log("4");

        //Crete both transactions:

        // console.log("4");
        app.context.orm.transaction.create({
          idUser: sellerID,
          companyId: ticker.dataValues.id,
          stockId: stockid.dataValues.id,
          // ticker: SKR,
          price: bestSellPrice,
          kind: "sell",
          amount: minAmount
        });

        app.context.orm.transaction.create({
          idUser: buyerID,
          companyId: ticker.dataValues.id,
          stockId: stockid.dataValues.id,
          // ticker: SKR,
          price: bestSellPrice,
          kind: "buy",
          amount: minAmount
        });
        console.log("3");
        // console.log("5");
      } else {
        console.log("No enough balance to execute transaction.")
      }
      
    } else {
      console.log("No transaction to be done.");
    }
    // console.log("6");
  }
  // console.log("7");
}
});

module.exports = app;