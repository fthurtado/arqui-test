require('dotenv').config();

const KoaRouter = require('koa-router');
const auth = require('./auth');

const router = new KoaRouter({ prefix: '/api' });
router.use('/auth', auth.routes());

module.exports = router;
