require('dotenv').config();

const KoaRouter = require('koa-router');
const jwt = require('koa-jwt');
const { apiSetCurrentUser } = require('../../middlewares/auth');

const users = require('./user');
const products = require('./stock');
const transactions = require('./transaction');
const limitOrder = require('./limitOrder');
const stats = require('./statistics');

const router = new KoaRouter({ prefix: '/api' });

router.use(jwt({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(apiSetCurrentUser);
router.use('/user', users.routes());
router.use('/stock', products.routes());
router.use('/transaction', transactions.routes());
router.use('/limitOrder', limitOrder.routes());
router.use('/statistics', stats.routes());

module.exports = router;
